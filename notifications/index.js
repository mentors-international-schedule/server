const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const notifySid = process.env.SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

route.post("/:id", authenticate, (req, res) => {
  const group_id = req.params.id;
  const user_id = req.decoded.id;
  const { message, contact_ids } = req.body;
  const phoneNumbers = [];
  const service = client.notify.services(notifySid);

  if (!message || !contact_ids) {
    res.status(422).json({ message: "Message and contacts required" });
  } else {
    db("contacts")
      .whereIn("id", contact_ids)
      .then(contacts => {
        contacts.map(contact => {
          phoneNumbers.push(contact.phone_number);
        });
        const bindings = phoneNumbers.map(number => {
          return JSON.stringify({ binding_type: "sms", address: number });
        });
        service.notifications
          .create({
            toBinding: bindings,
            body: message
          })
          .then(notification => {
            db("messages")
              .insert({ message, user_id, group_id })
              .returning("id")
              .then(result => {
                const entries = contact_ids.map(id => ({
                  contact_id: id,
                  message_id: result[0]
                }));
                db("messagesContacts")
                  .insert(entries)
                  .then(result => {
                    res.json(notification);
                  });
              });
          })
          .catch(err => {
            res.status(500).json(err);
          });
      });
  }
});

route.post("/drafts/:id", authenticate, (req, res) => {
  const group_id = req.params.id;
  const user_id = req.decoded.id;
  const { message } = req.body;

  if (!message) {
    res.status(422).json({ message: "Message required" });
  } else {
    db("messages")
      .insert({ message, user_id, sent: false, group_id })
      .returning("id")
      .then(result => {
        if (result[0]) {
          res
            .status(201)
            .json({ message: "Message saved as draft", message_id: result[0] });
        } else {
          res.status(500).json({ message: "Failed to save message as draft" });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

route.put("/drafts/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  const { message } = req.body;

  if (!message) {
    res.status(422).json({ message: "Message required" });
  } else {
    db("messages")
      .where({ id, user_id })
      .update({ message })
      .then(result => {
        if (result) {
          res.json({ message: "Message updated", success: true });
        } else {
          res.status(500).json({ message: "Failed to update status" });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

route.get("/:id", authenticate, (req, res) => {
  const group_id = req.params.id;

  db("messages")
    .where({ group_id })
    .then(messages => {
      if (messages.length) {
        res.json(messages);
      } else {
        res.status(404).json({ message: "No messages found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

module.exports = route;

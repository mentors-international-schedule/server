const route = require("express").Router();
const db = require("../data/dbConfig");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const notifySid = process.env.SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

route.post("/", (req, res) => {
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
            res.json(notification);
          })
          .catch(err => {
            res.status(500).json(err);
          });
      });
  }
});

module.exports = route;

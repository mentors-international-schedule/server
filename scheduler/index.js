const schedule = require("node-schedule");
const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const notifySid = process.env.SERVICE_SID;

route.post("/", authenticate, (req, res) => {
  const user_id = req.decoded.id;
  const { hour, minute, dayOfWeek, message, contact_ids } = req.body;
  const phoneNumbers = [];
  const client = require("twilio")(accountSid, authToken);
  const service = client.notify.services(notifySid);

  // if(!hour || !minute || !dayOfWeek) {
  //   res.status(422).json({ message: "Hour, minute and dayOfWeek required" });
  // } else {
  db("scheduled")
    .insert({ hour, minute, dayOfWeek, user_id })
    .returning("id")
    .then(result => {
      if (result[0]) {
        schedule.scheduleJob(
          { hour: hour, minute: minute, dayOfWeek: dayOfWeek },
          () => {
            db("contacts")
              .whereIn("id", contact_ids)
              .then(contacts => {
                contacts.map(contact => {
                  phoneNumbers.push(contact.phone_number);
                });
                const bindings = phoneNumbers.map(number => {
                  return JSON.stringify({
                    binding_type: "sms",
                    address: number
                  });
                });
                service.notifications
                  .create({
                    toBinding: bindings,
                    body: message
                  })
                  .then(notification => {
                    db("messages")
                      .insert({ message, user_id })
                      .returning("id")
                      .then(result => {
                        const entries = contact_ids.map(id => ({
                          contact_id: id,
                          message_id: result[0]
                        }));
                        db("messagesContacts")
                          .insert(entries)
                          .then(result => {
                            console.log(notification);
                          });
                      });
                  })
                  .catch(err => {
                    res.status(500).json(err);
                  });
              });
          }
        );
        res.json({ message: "Message has been scheduled" });
      } else {
        res.status(500).json({ message: "Failed to create schedule" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
  // }
});

module.exports = route;

const route = require("express").Router();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const notifySid = process.env.SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

route.post("/", (req, res) => {
  const phoneNumbers = ["+13053190388", "+19195000265"];
  const body = "Ice creams are coming!";
  const service = client.notify.services(notifySid);

  const bindings = phoneNumbers.map(number => {
    return JSON.stringify({ binding_type: "sms", address: number });
  });

  service.notifications
    .create({
      toBinding: bindings,
      body: body
    })
    .then(notification => {
      res.json(notification);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

module.exports = route;

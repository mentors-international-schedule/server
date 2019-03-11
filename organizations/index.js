const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");

route.get("/", (req, res) => {
  db("organizations")
    .then(org => {
      res.json(org);
    })
    .catch(error => {
      res.status(500).json({ message: "Server Error" });
    });
});

module.exports = route;

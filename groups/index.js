const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");

// GET My groups
route.get("/", authenticate, (req, res) => {
  const { id } = req.decoded;
  db("groups")
    .where({ user_id: id })
    .then(groups => {
      res.json(groups);
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});
// GET group contacts
route.get("/:id", authenticate, (req, res) => {
  const { id } = req.params;
  db("contacts")
    .where({ group_id: id })
    .then(contacts => {
      res.json(contacts);
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});
// POST group
route.post("/", authenticate, (req, res) => {
  const { id } = req.decoded;
  const { name } = req.body;

  if (!name) {
    res.status(422).json({ message: "Name required" });
  } else {
    db("groups")
      .insert({ name, user_id: id })
      .returning("id")
      .then(result => {
        if (result[0]) {
          res.status(201).json({ id: result[0], name, user_id: id });
        } else {
          res.status(500).json({ message: "Failed to add group" });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

// PUT group

// DELETE Group

module.exports = route;

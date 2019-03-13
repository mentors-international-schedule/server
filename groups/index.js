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
      // .returning("id")
      .then(result => {
        if (result.rowCount) {
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
route.put("/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;
  const { name } = req.body;

  if (!name) {
    res.status(422).json({ message: "Name required" });
  } else {
    if (id != user_id) {
      res.status(401).json({ message: "You cannot edit someone else's group" });
    } else {
      db("groups")
        .where({ id })
        .update({ name })
        .then(result => {
          if (result) {
            res.status(200).json({ id, name, user_id });
          } else {
            res.status(500).json({ message: "Failed to update group" });
          }
        })
        .catch(() => {
          res.status(500).json({ message: "Server Error" });
        });
    }
  }
});
// DELETE Group
route.delete("/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;

  db("groups")
    .where({ id })
    .first()
    .then(group => {
      if (!group) {
        res.status(404).json({ message: "group does not exist" });
      } else {
        if (group.user_id != user_id) {
          res.status(403).json({
            message: "you are not allowed to delete some one else's post"
          });
        } else {
          db("groups")
            .where({ id })
            .del()
            .then(result => {
              if (result) {
                res.json({ message: "Deleted group", success: true });
              } else {
                res.status(500).json({ message: "Failed to delete group" });
              }
            })
            .catch(() => {
              res.status(500).json({ message: "Server Error" });
            });
        }
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

module.exports = route;

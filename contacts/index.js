const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");

route.post("/", authenticate, (req, res) => {
  const { name, phone_number, group_id } = req.body;
  const { id: user_id } = req.decoded;

  if (!name || !phone_number || !group_id) {
    res.status(422).json({ message: "Name and Phone number required" });
  } else {
    db("groups")
      .where({ user_id, id: group_id })
      .count()
      .then(count => {
        if (!count) {
          res.status(403).json({ message: "you are not authorized" });
        } else {
          db("contacts")
            .insert({ name, phone_number, group_id })
            .returning("id")
            .then(result => {
              if (result[0]) {
                res
                  .status(201)
                  .json({ id: result[0], name, phone_number, group_id });
              } else {
                res.status(500).json({ message: "Failed to add contacts" });
              }
            })
            .catch(() => {
              res.status(500).json({ message: "Failed to add contacts" });
            });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

route.delete("/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const user_id = req.decoded.id;

  db("contacts")
    .where({ id })
    .first()
    .then(contact => {
      if (!contact) {
        res.status(404).json({ message: "Contact not found" });
      } else {
        db("groups")
          .where({ id: contact.group_id })
          .first()
          .then(group => {
            if (group.user_id != user_id) {
              res
                .status(403)
                .json({ message: "You can not delete this contact" });
            } else {
              db("contacts")
                .where({ id })
                .del()
                .then(result => {
                  if (result) {
                    res.json({
                      message: "Contact deleted successfully",
                      success: true
                    });
                  } else {
                    res
                      .status(500)
                      .json({ message: "Failed to delete contact" });
                  }
                })
                .catch(() => {
                  res.status(500).json({ message: "Server Error" });
                });
            }
          })
          .catch(() => {
            res.status(500).json({ message: "Server Error" });
          });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

module.exports = route;

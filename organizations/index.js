const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");

route.get("/", authenticate, (req, res) => {
  db("organizations")
    .then(org => {
      res.json(org);
    })
    .catch(error => {
      res.status(500).json({ message: "Server Error" });
    });
});

route.post("/", authenticate, (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(422).json({ message: "Organization name is required" });
  } else {
    db("organizations")
      .where({ name })
      .first()
      .then(org => {
        if (org) {
          res.status(401).json({ message: "Organization already exists" });
        } else {
          const user_id = req.decoded.id;

          db("organizations")
            .insert({ name, user_id })
            .returning("id")
            .then(id => {
              if (id[0]) {
                db("organizations").then(orgs => {
                  res.status(201).json(orgs);
                });
              } else {
                res.status(401).json({ message: "Failed to add organization" });
              }
            })
            .catch(error => {
              res.status(500).json({ message: "Server Error" });
            });
        }
      })
      .catch(error => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

module.exports = route;

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

route.get("/myorgs", authenticate, (req, res) => {
  const user_id = req.decoded.id;

  db("organizations")
    .then(org => {
      const orgs = org.filter(o => o.user_id === user_id);
      res.json(orgs);
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
                db("userOrganizations")
                  .insert({ user_id, oragnization_id: id[0] })
                  .returning("id")
                  .then(result => {
                    if (result[0]) {
                      res.status(201).json({
                        message: "Successfully created",
                        success: true
                      });
                    } else {
                      res
                        .status(500)
                        .json({ message: "Failed to join organization" });
                    }
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

route.delete("/:id", (req, res) => {
  const { id } = req.params;

  db("organizations")
    .where({ id })
    .first()
    .then(org => {
      if (!org) {
        res.status(404).json({ message: "Organization does not exists" });
      } else {
        db("organizations")
          .where({ id })
          .del()
          .then(result => {
            if (result) {
              db("organizations").then(orgs => {
                res.json(orgs);
              });
            } else {
              res
                .status(401)
                .json({ message: "Failed to delete organization" });
            }
          });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Server error" });
    });
});

route.put("/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    res.status(422).json({ message: "Name is required" });
  } else {
    db("organizations")
      .where({ id })
      .first()
      .then(org => {
        if (!org) {
          res.status(404).json({ message: "Organization does not exist" });
        } else {
          db("organizations")
            .where({ id })
            .update({ name })
            .then(result => {
              if (result) {
                db("organizations").then(orgs => {
                  res.json(orgs);
                });
              } else {
                res
                  .status(401)
                  .json({ message: "Failed to update organization" });
              }
            })
            .catch(error => {
              res.status(500).json({ message: "Organization already exists" });
            });
        }
      })
      .catch(error => {
        res.status(500).json({ message: "Server Error" });
      });
  }
});

route.post("/join", authenticate, (req, res) => {
  const user_id = req.decoded.id;
  const { organization_id } = req.body;

  db("userOrganizations")
    .insert({ user_id, organization_id })
    .then(result => {
      if (result.rowCount) {
        res
          .status(201)
          .json({ message: "Succefully joined organization", success: true });
      } else {
        res.status(500).json({ message: "Failed to join organization" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

module.exports = route;

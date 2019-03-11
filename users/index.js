const route = require("express").Router();
const db = require("../data/dbConfig");
const bcrypt = require("bcryptjs");
const { genToken } = require("../common/authentication");

route.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    res.status(422).json({ message: "All fields required" });
  } else {
    db("users")
      .where({ email })
      .first()
      .then(user => {
        if (user) {
          res.status(401).json({ message: "User already exists." });
        } else {
          const hash = bcrypt.hashSync(password, 10);
          db("users")
            .insert({ firstname, lastname, email, password: hash })
            .returning("id")
            .then(result => {
              db("users")
                .where({ id: result[0] })
                .first()
                .then(newUser => {
                  genToken(newUser).then(token => {
                    res.status(201).json({
                      id: newUser.id,
                      email: newUser.email,
                      firstname: newUser.firstname,
                      lastname: newUser.lastname,
                      token
                    });
                  });
                });
            });
        }
      })
      .catch(error => res.status(500).json({ message: error }));
  }
});

route.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ message: "All fields required" });
  } else {
    db("users")
      .where({ email })
      .first()
      .then(user => {
        if (user) {
          const isValid = bcrypt.compareSync(password, user.password);
          if (isValid) {
            genToken(newUser).then(token => {
              res.status(201).json({
                id: newUser.id,
                email: newUser.email,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                token
              });
            });
          } else {
            res.status(403).json({ message: "Invalid credentials" });
          }
        } else {
          res.status(404).json({ message: "User not found" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: "Server error" });
      });
  }
});

module.exports = route;

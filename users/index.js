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

module.exports = route;

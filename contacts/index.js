const route = require("express").Router();
const db = require("../data/dbConfig");
const { authenticate } = require("../common/authentication");

route.get("/", authenticate, (req, res) => {});

module.exports = route;

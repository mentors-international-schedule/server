const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const notifications = require("./notifications");
const organizations = require("./organizations");
const users = require("./users");
const groups = require("./groups");
const contacts = require("./contacts");
const server = express();

// Middleware
server.use(helmet());
server.use(morgan("dev"));
server.use(express.json());
server.use(cors());
// Routes
server.use("/api/notifications", notifications);
server.use("/api/users", users);
server.use("/api/organizations", organizations);
server.use("/api/groups", groups);
server.use("/api/contacts", contacts);
module.exports = server;

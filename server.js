const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
// const notifications = require("./notifications");
const users = require("./users");
const server = express();

// Middleware
server.use(helmet());
server.use(morgan("dev"));
server.use(express.json());
server.use(cors());
// Routes
// server.use("/api/notifications", notifications);
server.use("/api/users", users);

module.exports = server;

const express = require("express");
const app = express.Router();

/*
app.get("/THING", (req, res) => {
});

 */

app.get("/", (req, res) => {
  res.send("you have verified!");
});

module.exports = app;
//text

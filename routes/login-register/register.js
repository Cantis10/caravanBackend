const express = require("express");
const app = express.Router();
const db = require("../../imports/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
app.customPath = "/api";

app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      console.log("missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length > 255) {
      console.log("password too long");
      return res.status(400).json({ error: "Password too long" });
    }

    if (first_name.length > 100 || last_name.length > 100) {
      console.log("name too long");
      return res.status(400).json({ error: "Name too long" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("invalid email format");
      return res.status(400).json({ error: "Invalid email format" });
    }

    //TODO: add into
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = app;

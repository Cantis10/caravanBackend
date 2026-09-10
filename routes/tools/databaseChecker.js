const express = require("express");
const app = express.Router();
const db = require("../../imports/database");

app.customPath = "/";
app.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT 1 AS test");

    res.json({
      success: true,
      database: "working",
      result: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      database: "not working",
      error: error.message,
    });
  }
});

module.exports = app;

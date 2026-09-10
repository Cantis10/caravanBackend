const express = require("express");
const path = require("path");

const app = express.Router();

const filesPath = path.join(__dirname, "../../files");
app.use(express.static(filesPath));

app.customPath = "/user";
app.get("/shopping", (req, res) => {
  console.log("Route hit: /user/shoppingCart");
  res.sendFile(path.join(filesPath, "shoppingcart.html"));
});

app.get("/order", (req, res) => {
  console.log("Route hit: /user/orderHistory");
  res.sendFile(path.join(filesPath, "Orderhistory.html"));
});

app.get("/profile", (req, res) => {
  console.log("Route hit: /user/profile");
  res.sendFile(path.join(filesPath, "ProfilePage.html"));
});

module.exports = app;

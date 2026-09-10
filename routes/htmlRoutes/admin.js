const express = require("express");
const path = require("path");

const app = express.Router();

const filesPath = path.join(__dirname, "../../files");
app.use(express.static(filesPath));

app.customPath = "/admin";
app.get("/dashboard", (req, res) => {
  console.log("Route hit: /admin/dashboard");
  res.sendFile(path.join(filesPath, "AdminDashboard.html"));
});

app.get("/accountManagement", (req, res) => {
  console.log("Route hit: /admin/accountManagement");
  res.sendFile(path.join(filesPath, "AccountManagement.html"));
});

app.get("/contentManagement", (req, res) => {
  console.log("Route hit: /admin/contentManagement");
  res.sendFile(path.join(filesPath, "ContentManagement.html"));
});

app.get("/audit", (req, res) => {
  console.log("Route hit: /admin/audit");
  res.sendFile(path.join(filesPath, "Audit.html"));
});

app.get("/ordersReports", (req, res) => {
  console.log("Route hit: /admin/ordersReports");
  res.sendFile(path.join(filesPath, "OrdersReports.html"));
});

app.get("/productsReports", (req, res) => {
  console.log("Route hit: /admin/productsReports");
  res.sendFile(path.join(filesPath, "Products & Reports.html"));
});

app.get("/salesReport", (req, res) => {
  console.log("Route hit: /admin/salesReport");
  res.sendFile(path.join(filesPath, "SalesReport.html"));
});

app.get("/stocksInventory", (req, res) => {
  console.log("Route hit: /admin/stocksInventory");
  res.sendFile(path.join(filesPath, "StocksInventory.html"));
});

app.get("/settings", (req, res) => {
  console.log("Route hit: /admin/settings");
  res.sendFile(path.join(filesPath, "SettingsConfig.html"));
});

module.exports = app;

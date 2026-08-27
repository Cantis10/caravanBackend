const express = require("express");
const app = express.Router();

app.customPath = '/sanitier';
app.get("/", (req, res) => {

    res.send('you are sane!');
});





module.exports = app;
//text
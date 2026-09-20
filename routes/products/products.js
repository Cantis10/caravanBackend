const express = require("express");
const app = express.Router();
const path = require("path");
const { requireAuth } = require("../../imports/token");

const db = require("../../imports/database");
app.customPath = "/api";
app.get("/fetchProducts", async (req, res) => {
  const { productId } = req.query;

  try {
    let result;

    if (productId) {
      result = await db.execute({
        sql: `
          SELECT
              p.product_id,
              c.country_name AS country,
              p.Prod_name,
              p.Prod_likes,
              p.Prod_price,
              p.Prod_amount,
              p.Prod_img,
              p."desc"
          FROM Product p
          JOIN Countries c
              ON p.country_id = c.country_id
          WHERE p.product_id = ?;
        `,
        args: [productId],
      });
    } else {
      result = await db.execute({
        sql: `
          SELECT
              p.product_id,
              c.country_name AS country,
              p.Prod_name,
              p.Prod_likes,
              p.Prod_price,
              p.Prod_amount,
              p.Prod_img,
              p."desc"
          FROM Product p
          JOIN Countries c
              ON p.country_id = c.country_id;
        `,
        args: [],
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
app.post("/addProduct", requireAuth("admin"), async (req, res) => {
  try {
    const {
      country_id,
      Prod_name,
      Prod_likes,
      Prod_price,
      Prod_amount,
      Prod_img,
      desc,
    } = req.body;

    const result = await db.execute({
      sql: `
        INSERT INTO Product (
          country_id,
          Prod_name,
          Prod_likes,
          Prod_price,
          Prod_amount,
          Prod_img,
          "desc"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        country_id,
        Prod_name,
        Prod_likes,
        Prod_price,
        Prod_amount,
        Prod_img,
        desc,
      ],
    });

    res.status(201).json({
      message: "Product added successfully",
      product_id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to add product",
    });
  }
});

module.exports = app;

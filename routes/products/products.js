const express = require("express");
const app = express.Router();
const path = require("path");
const { requireAuth } = require("../../imports/token");

const db = require("../../imports/database");
app.customPath = "/api";


app.get("/fetchProducts", async (req, res) => {
  const { productId } = req.query;

  try {
    const params = [];
    let whereClause = "";

    if (productId) {
      whereClause = "WHERE p.product_id = ?";
      params.push(productId);
    }

    const result = await db.execute({
      sql: `
        SELECT
          p.product_id,
          p.Prod_name,
          p.Prod_likes,
          p.Prod_price,
          p.Prod_amount,
          p.Prod_img,
          p."desc",

          c.country_id,
          c.country_name,

          cat.category_id,
          cat.category_name

        FROM Product p

        LEFT JOIN Countries c
          ON p.country_id = c.country_id

        LEFT JOIN Product_categories pc
          ON p.product_id = pc.product_id

        LEFT JOIN Categories cat
          ON pc.category_id = cat.category_id

        ${whereClause}

        ORDER BY
          p.product_id,
          cat.category_id
      `,
      args: params
    });

    const productsMap = new Map();

    result.rows.forEach((row) => {
      const productId = Number(row.product_id);

      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          product_id: productId,
          product_name: row.Prod_name,
          product_price: Number(row.Prod_price),
          product_amount: Number(row.Prod_amount),
          product_likes: Number(row.Prod_likes),
          product_desc: row.desc || "",

          product_country: row.country_name || null,

          product_category: [],

          product_image: row.Prod_img || ""
        });
      }

      if (row.category_id !== null && row.category_id !== undefined) {
        productsMap.get(productId).product_category.push({
          category_id: Number(row.category_id),
          category_name: row.category_name
        });
      }
    });

    const products = Array.from(productsMap.values());

    if (productId) {
      if (products.length === 0) {
        return res.status(404).json({
          error: "Product not found"
        });
      }

      return res.status(200).json(products[0]);
    }

    return res.status(200).json(products);

  } catch (error) {
    console.error("Failed to fetch products:", error);

    return res.status(500).json({
      error: "Failed to fetch products"
    });
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

const express = require("express");
const app = express.Router();
const { requireAuth } = require("../../imports/token");

const db = require("../../imports/database");

app.customPath = "/api";

app.get("/fetchWishlist", requireAuth("user"), async (req, res) => {
  const customerId = req.user.userId;

  try {
    let result;

    if (customerId) {
      result = await db.execute({
        sql: `
          SELECT
            w.Customer_id,
            p.product_id,
            p.Prod_name,
            p.Prod_likes,
            p.Prod_price,
            p.Prod_amount,
            p.Prod_img,
            p."desc"
          FROM Wishlist w
          JOIN Product p
            ON w.product_id = p.product_id
          WHERE w.Customer_id = ?
        `,
        args: [customerId],
      });
    } else {
      result = await db.execute({
        sql: `
          SELECT
            w.Customer_id,
            p.product_id,
            p.Prod_name,
            p.Prod_likes,
            p.Prod_price,
            p.Prod_amount,
            p.Prod_img,
            p."desc"
          FROM Wishlist w
          JOIN Product p
            ON w.product_id = p.product_id
        `,
        args: [],
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch wishlist",
    });
  }
});
app.post("/addWishlist", requireAuth("user"), async (req, res) => {
  const { productId } = req.body;

  // User data comes from the JWT
  const customerId = req.user.userId;

  try {
    if (!productId) {
      return res.status(400).json({
        error: "productId is required",
      });
    }

    await db.execute({
      sql: `
        INSERT INTO Wishlist (Customer_id, product_id)
        VALUES (?, ?)
      `,
      args: [customerId, productId],
    });

    res.status(201).json({
      message: "Product added to wishlist",
      customerId,
      productId,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message?.includes("UNIQUE") ||
      error.message?.includes("PRIMARY KEY")
    ) {
      return res.status(409).json({
        error: "Product is already in the wishlist",
      });
    }

    res.status(500).json({
      error: "Failed to add product to wishlist",
    });
  }
});

module.exports = app;

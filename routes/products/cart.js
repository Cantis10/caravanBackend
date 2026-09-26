const express = require("express");

const app = express.Router();

const {
    requireAuth
} = require("../../imports/token");

const db = require("../../imports/database");

/*
 * This makes the routes:
 *
 * POST /api/cart/items
 * GET  /api/cart
 */
app.customPath = "/api/cart";


/*
 * ADD A PRODUCT OR BUNDLE TO THE LOGGED-IN CUSTOMER'S CART
 *
 * Expected request body:
 *
 * {
 *     productId: 1,
 *     productSize: "8oz",
 *     quantity: 1
 * }
 */
app.post(
    "/items",
    requireAuth("user"),
    async (req, res) => {
        try {
            const customerId =
                Number(req.user.userId);

            const productId =
                Number(req.body.productId);

            const productSize =
                String(
                    req.body.productSize || ""
                ).trim();

            const quantity =
                Number(req.body.quantity || 1);

            /*
             * Validate the logged-in customer.
             */
            if (!customerId) {
                return res.status(401).json({
                    error:
                        "Customer is not logged in"
                });
            }

            /*
             * Validate the product ID.
             *
             * Bundles also use product_id because they
             * are stored in the Product table.
             */
            if (!Number.isInteger(productId) ||
                productId <= 0) {

                return res.status(400).json({
                    error:
                        "A valid productId is required"
                });
            }

            /*
             * Validate the selected size.
             */
            if (!productSize) {
                return res.status(400).json({
                    error:
                        "A product size is required"
                });
            }

            /*
             * Validate the quantity.
             */
            if (!Number.isInteger(quantity) ||
                quantity <= 0) {

                return res.status(400).json({
                    error:
                        "Quantity must be a positive integer"
                });
            }

            /*
             * Verify that the selected product or bundle
             * exists in the Product table.
             */
            const productResult =
                await db.execute({
                    sql: `
                        SELECT
                            product_id,
                            Prod_name,
                            type_id
                        FROM Product
                        WHERE product_id = ?
                    `,
                    args: [productId]
                });

            if (productResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Product or bundle not found"
                });
            }

            const product =
                productResult.rows[0];

            /*
             * Look for the customer's existing active cart.
             */
            let cartResult =
                await db.execute({
                    sql: `
                        SELECT
                            Cart_id,
                            Customer_id,
                            Creation_date,
                            status
                        FROM Cart
                        WHERE Customer_id = ?
                        AND status = 'active'
                        ORDER BY Cart_id DESC
                        LIMIT 1
                    `,
                    args: [customerId]
                });

            let cartId;
            let cartCreated = false;

            /*
             * Create a new active cart if the customer
             * does not currently have one.
             */
            if (cartResult.rows.length === 0) {
                const createCartResult =
                    await db.execute({
                        sql: `
                            INSERT INTO Cart (
                                Customer_id,
                                Creation_date,
                                status
                            )
                            VALUES (
                                ?,
                                CURRENT_TIMESTAMP,
                                'active'
                            )
                            RETURNING Cart_id
                        `,
                        args: [customerId]
                    });

                if (
                    !createCartResult.rows ||
                    createCartResult.rows.length === 0
                ) {
                    throw new Error(
                        "Unable to create cart"
                    );
                }

                cartId = Number(
                    createCartResult.rows[0].Cart_id
                );

                cartCreated = true;

            } else {
                cartId = Number(
                    cartResult.rows[0].Cart_id
                );
            }

            /*
             * Check whether the same product and size
             * already exist in this active cart.
             */
            const existingItemResult =
                await db.execute({
                    sql: `
                        SELECT
                            Cart_id,
                            product_id,
                            Product_Size,
                            Quantity
                        FROM Cart_items
                        WHERE Cart_id = ?
                        AND product_id = ?
                        AND Product_Size = ?
                        LIMIT 1
                    `,
                    args: [
                        cartId,
                        productId,
                        productSize
                    ]
                });

            if (
                existingItemResult.rows.length > 0
            ) {
                return res.status(409).json({
                    error:
                        "This item with the selected size is already in your cart",
                    alreadyExists: true,
                    cartId: cartId,
                    productId: productId,
                    productSize: productSize
                });
            }

            /*
             * Insert the selected item into Cart_items.
             */
            await db.execute({
                sql: `
                    INSERT INTO Cart_items (
                        Cart_id,
                        product_id,
                        Product_Size,
                        Quantity
                    )
                    VALUES (?, ?, ?, ?)
                `,
                args: [
                    cartId,
                    productId,
                    productSize,
                    quantity
                ]
            });

            return res.status(201).json({
                message:
                    "Item added to cart successfully",

                cartId: cartId,
                cartCreated: cartCreated,

                item: {
                    productId: productId,
                    productName:
                        product.Prod_name,
                    productType:
                        Number(product.type_id),
                    productSize: productSize,
                    quantity: quantity
                }
            });

        } catch (error) {
            console.error(
                "Failed to add item to cart:",
                error
            );

            /*
             * Database-level fallback for the unique index.
             */
            if (
                error.message?.includes("UNIQUE") ||
                error.message?.includes("PRIMARY KEY")
            ) {
                return res.status(409).json({
                    error:
                        "This item with the selected size is already in your cart",
                    alreadyExists: true
                });
            }

            return res.status(500).json({
                error:
                    "Failed to add item to cart"
            });
        }
    }
);


/*
 * GET THE LOGGED-IN CUSTOMER'S ACTIVE CART
 *
 * This will be used later by shoppingcart.js.
 */
app.get(
    "/",
    requireAuth("user"),
    async (req, res) => {
        try {
            const customerId =
                Number(req.user.userId);

            if (!customerId) {
                return res.status(401).json({
                    error:
                        "Customer is not logged in"
                });
            }

            
            //Find the customer's active cart.
            const cartResult =
                await db.execute({
                    sql: `
                        SELECT
                            Cart_id,
                            Customer_id,
                            Creation_date,
                            status
                        FROM Cart
                        WHERE Customer_id = ?
                        AND status = 'active'
                        ORDER BY Cart_id DESC
                        LIMIT 1
                    `,
                    args: [customerId]
                });

            /*
             * The user has not added anything yet, so an
             * active cart does not exist.
             */
            if (cartResult.rows.length === 0) {
                return res.status(200).json({
                    cart: null,
                    items: []
                });
            }

            const cart =
                cartResult.rows[0];

            const cartId =
                Number(cart.Cart_id);

            
            //Fetch all items belonging to the active cart.
            const itemsResult =
                await db.execute({
                    sql: `
                        SELECT
                            ci.Cart_id AS cart_id,
                            ci.product_id,
                            ci.Product_Size AS product_size,
                            ci.Quantity AS quantity,

                            p.Prod_name AS product_name,
                            p.Prod_price AS product_price,
                            p.Prod_img AS product_image,
                            p.type_id

                        FROM Cart_items ci

                        JOIN Product p
                            ON p.product_id =
                               ci.product_id

                        WHERE ci.Cart_id = ?

                        ORDER BY p.Prod_name ASC
                    `,
                    args: [cartId]
                });

            return res.status(200).json({
                cart: {
                    cartId: cartId,
                    customerId:
                        Number(cart.Customer_id),
                    creationDate:
                        cart.Creation_date,
                    status:
                        cart.status
                },

                items:
                    itemsResult.rows
            });

        } catch (error) {
            console.error(
                "Failed to fetch active cart:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to fetch active cart"
            });
        }
    }
);

app.put(
    "/items/:productId",
    requireAuth("user"),
    async (req, res) => {
        try {
            const customerId = Number(req.user.userId);
            const productId = Number(req.params.productId);
            const productSize = Number(req.body.productSize);
            const quantity = Number(req.body.quantity);

            if (
                !customerId ||
                !productId ||
                !productSize ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return res.status(400).json({
                    error:
                        "Valid productId, productSize and quantity are required"
                });
            }

            const cartResult =
                await db.execute({
                    sql: `
                        SELECT Cart_id
                        FROM Cart
                        WHERE Customer_id = ?
                        AND status = 'active'
                        ORDER BY Cart_id DESC
                        LIMIT 1
                    `,
                    args: [customerId]
                });

            if (cartResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Active cart not found"
                });
            }

            const cartId =
                Number(
                    cartResult.rows[0].Cart_id
                );

            const existingResult =
                await db.execute({
                    sql: `
                        SELECT product_id
                        FROM Cart_items
                        WHERE Cart_id = ?
                        AND product_id = ?
                        AND Product_Size = ?
                    `,
                    args: [
                        cartId,
                        productId,
                        productSize
                    ]
                });

            if (existingResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Cart item not found"
                });
            }

            await db.execute({
                sql: `
                    UPDATE Cart_items
                    SET Quantity = ?
                    WHERE Cart_id = ?
                    AND product_id = ?
                    AND Product_Size = ?
                `,
                args: [
                    quantity,
                    cartId,
                    productId,
                    productSize
                ]
            });

            return res.status(200).json({
                message:
                    "Cart quantity updated",

                cartId,
                productId,
                productSize,
                quantity
            });

        } catch (error) {
            console.error(
                "Failed to update cart quantity:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to update cart quantity"
            });
        }
    }
);

app.delete(
    "/items/:productId",
    requireAuth("user"),
    async (req, res) => {
        try {
            const customerId = Number(req.user.userId);
            const productId = Number(req.params.productId);
            const productSize = Number(req.query.productSize);

            if (
                !customerId ||
                !productId ||
                !productSize
            ) {
                return res.status(400).json({
                    error:
                        "Valid productId and productSize are required"
                });
            }

            const cartResult =
                await db.execute({
                    sql: `
                        SELECT Cart_id
                        FROM Cart
                        WHERE Customer_id = ?
                        AND status = 'active'
                        ORDER BY Cart_id DESC
                        LIMIT 1
                    `,
                    args: [customerId]
                });

            if (cartResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Active cart not found"
                });
            }

            const cartId = Number(
                cartResult.rows[0].Cart_id
            );

            const existingResult =
                await db.execute({
                    sql: `
                        SELECT product_id
                        FROM Cart_items
                        WHERE Cart_id = ?
                        AND product_id = ?
                        AND Product_Size = ?
                    `,
                    args: [
                        cartId,
                        productId,
                        productSize
                    ]
                });

            if (existingResult.rows.length === 0) {
                return res.status(404).json({
                    error:
                        "Cart item not found"
                });
            }

            await db.execute({
                sql: `
                    DELETE FROM Cart_items
                    WHERE Cart_id = ?
                    AND product_id = ?
                    AND Product_Size = ?
                `,
                args: [
                    cartId,
                    productId,
                    productSize
                ]
            });

            return res.status(200).json({
                message:
                    "Cart item removed",

                cartId,
                productId,
                productSize
            });

        } catch (error) {
            console.error(
                "Failed to remove cart item:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to remove cart item"
            });
        }
    }
);

module.exports = app;
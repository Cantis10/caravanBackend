const express = require("express");
const router = express.Router();
const db = require("../../imports/database");
const { checkAuth } = require("../../imports/token");

router.customPath = "/api";

// GET CURRENT USER PROFILE
router.get("/profile", checkAuth("user"), async (req, res) => {
    try {

        console.log("Profile user:", req.user);

        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({
                error: "User ID not found"
            });
        }

        const result = await db.execute({
            sql: `
                SELECT
                    Customer_id,
                    first_name,
                    last_name,
                    Cus_email,
                    Cus_birthdate
                FROM Customer
                WHERE Customer_id = ?
            `,
            args: [userId]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        const customer = result.rows[0];

        return res.status(200).json({
            customerId: customer.Customer_id,
            email: customer.Cus_email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            birthdate: customer.Cus_birthdate
        });

    } catch (error) {

        console.error("Profile API error:", error);

        return res.status(500).json({
            error: "Unable to retrieve profile"
        });
    }
});

// UPDATE CURRENT USER PROFILE
router.put("/profile", checkAuth("user"), async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            email,
            firstName,
            lastName,
            birthdate,
            password
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                error: "User ID not found"
            });
        }

        if (!email || !firstName || !lastName) {
            return res.status(400).json({
                error: "Email, first name, and last name are required"
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                error: "Invalid email format"
            });
        }

        if (firstName.length > 100 || lastName.length > 100) {
            return res.status(400).json({
                error: "First name or last name is too long"
            });
        }

        // Make sure another account is not already using the email.
        const existingEmail = await db.execute({
            sql: `
                SELECT Customer_id
                FROM Customer
                WHERE Cus_email = ?
                AND Customer_id != ?
            `,
            args: [email, userId]
        });

        if (existingEmail.rows.length > 0) {
            return res.status(409).json({
                error: "Email is already used by another account"
            });
        }

        /*
         * Only update the password when the user entered a new value.
         * An empty password means "keep the current password".
         */
        if (password && password.trim() !== "") {
            if (password.length > 255) {
                return res.status(400).json({
                    error: "Password is too long"
                });
            }

            await db.execute({
                sql: `
                    UPDATE Customer
                    SET
                        Cus_email = ?,
                        first_name = ?,
                        last_name = ?,
                        Cus_birthdate = ?,
                        Cus_password = ?
                    WHERE Customer_id = ?
                `,
                args: [
                    email,
                    firstName,
                    lastName,
                    birthdate || null,
                    password,
                    userId
                ]
            });
        } else {
            await db.execute({
                sql: `
                    UPDATE Customer
                    SET
                        Cus_email = ?,
                        first_name = ?,
                        last_name = ?,
                        Cus_birthdate = ?
                    WHERE Customer_id = ?
                `,
                args: [
                    email,
                    firstName,
                    lastName,
                    birthdate || null,
                    userId
                ]
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: {
                email: email,
                firstName: firstName,
                lastName: lastName,
                birthdate: birthdate || null
            }
        });

    } catch (error) {
        console.error("Profile update error:", error);

        return res.status(500).json({
            error: "Unable to update profile"
        });
    }
});

module.exports = router;
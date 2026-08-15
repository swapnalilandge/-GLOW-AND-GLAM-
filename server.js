require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL Connection
// In server.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce'
});

db.connect((err) => {
    if (err) {
        console.log("Database connection skipped or unavailable on cloud. Running server in demo mode.");
    } else {
        console.log("MySQL Database Connected!");
    }
});

app.get("/", (req, res) => {
    res.send("Glow & Glam Backend is Running");
});
app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        res.json(result);
    });
});
app.post("/products", (req, res) => {

    const { name, category, price, image, description, stock } = req.body;

    const sql = `
        INSERT INTO products
        (name, category, price, image, description, stock)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, category, price, image, description, stock],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to add product"
                });
            }

            res.json({
                success: true,
                message: "Product added successfully!"
            });
        }
    );
});
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (result.length > 0) {
            res.json({
                success: true,
                message: "Login successful!"
            });
        } else {
            res.json({
                success: false,
                message: "Invalid email or password"
            });
        }
    });
});
app.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, password], (err, result) => {

        if (err) {
            console.log(err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.json({
                    success: false,
                    message: "Email already registered."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Registration failed."
            });
        }

        res.json({
            success: true,
            message: "Account created successfully!"
        });
    });
});
app.post("/orders", (req, res) => {

    const { user_email, total_amount } = req.body;

    const order_id = "GG" + Math.floor(100000 + Math.random() * 900000);

    const sql = `
        INSERT INTO orders
        (order_id, user_email, total_amount)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [order_id, user_email, total_amount],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Order could not be placed."
                });
            }

            res.json({
                success: true,
                message: "Order placed successfully!",
                order_id: order_id
            });
        }
    );
});
app.get("/orders/:email", (req, res) => {

    const email = req.params.email;

    const sql = `
        SELECT order_id, total_amount, order_date, status
        FROM orders
        WHERE user_email = ?
        ORDER BY order_date DESC
    `;

    db.query(sql, [email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Unable to fetch orders"
            });
        }

        res.json({
            success: true,
            orders: result
        });
    });
});
app.get("/orders/:email", (req, res) => {
    const email = req.params.email;

    const sql = "SELECT * FROM orders WHERE user_email = ? ORDER BY order_date DESC";

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false });
        }

        res.json(result);
    });
});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
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

// In-memory demo storage
const usersList = [];
const ordersList = [];
const productsList = [];

app.get("/", (req, res) => {
    res.send("Glow & Glam Backend is Running");
});

// PRODUCTS ROUTES (With Fallback)
app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, result) => {
        if (err) {
            return res.json(productsList); // Fallback to memory
        }
        res.json(result);
    });
});

app.post("/products", (req, res) => {
    const { name, category, price, image, description, stock } = req.body;
    const sql = `INSERT INTO products (name, category, price, image, description, stock) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, category, price, image, description, stock], (err, result) => {
        if (err) {
            productsList.push({ name, category, price, image, description, stock });
            return res.json({ success: true, message: "Product added (Demo mode)!" });
        }
        res.json({ success: true, message: "Product added successfully!" });
    });
});

// LOGIN ROUTE (With Fallback)
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            // Check in-memory user list
            const user = usersList.find(u => u.email === email && u.password === password);
            if (user) {
                return res.json({ success: true, message: "Login successful!" });
            }
            return res.json({ success: false, message: "Invalid email or password" });
        }

        if (result.length > 0) {
            res.json({ success: true, message: "Login successful!" });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

// 1. REGISTER ROUTE
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = usersList.find(u => u.email === email);
    if (existingUser) {
        return res.json({
            success: false,
            message: "Email already registered."
        });
    }

    usersList.push({ name, email, password });
    console.log("👤 NEW USER REGISTERED:", email);

    return res.json({
        success: true,
        message: "Account created successfully!"
    });
});

// 2. PLACE ORDER ROUTE
app.post("/orders", (req, res) => {
    const { user_email, total_amount } = req.body;
    const mockOrderId = "GG" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
        order_id: mockOrderId,
        user_email: user_email,
        total_amount: total_amount,
        order_date: new Date().toISOString(),
        status: "Success"
    };

    ordersList.push(newOrder);

    console.log("====================================");
    console.log("🛒 NEW ORDER RECEIVED!");
    console.log(`Order ID:     ${mockOrderId}`);
    console.log(`User Email:   ${user_email}`);
    console.log(`Total Amount: ₹${total_amount}`);
    console.log("====================================");

    return res.json({
        success: true,
        order_id: mockOrderId,
        message: "Order placed successfully!"
    });
});

// 3. FETCH USER ORDERS ROUTE (Clean Single Route)
app.get("/orders/:email", (req, res) => {
    const email = req.params.email;
    const userOrders = ordersList.filter(o => o.user_email === email);

    return res.json({
        success: true,
        orders: userOrders
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
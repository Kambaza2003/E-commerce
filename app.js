const express = require("express");
const pool = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticateToken } = require("./middlewares/authMiddleware");

const app = express();

app.use(express.json());

app.use(productRoutes);
app.use(categoryRoutes);
app.use(userRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "E-Commerce API is running"
    });
});

app.get("/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Welcome!",
        user: req.user
    });
});

const PORT = 7000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
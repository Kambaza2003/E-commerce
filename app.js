require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contentRoutes = require("./routes/contentRoutes");
const productImagesRoutes = require("./routes/productImagesRoutes")
const { authenticateToken } = require("./middlewares/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use(productRoutes);
app.use(categoryRoutes);
app.use(userRoutes);
app.use(orderRoutes);
app.use(cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use(paymentRoutes);
app.use(contentRoutes);
app.use("/product-images",productImagesRoutes);

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

console.log(
    process.env.PAYSTACK_SECRET_KEY
        ? "Paystack key loaded"
        : "Paystack key missing"
);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
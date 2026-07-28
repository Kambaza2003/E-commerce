const express = require("express");
const pool = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

app.use(productRoutes);
app.use(categoryRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "E-Commerce API is running"
    });
});

const PORT = 7000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
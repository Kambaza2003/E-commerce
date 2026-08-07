const express = require("express");

const {
    addToCart
 } = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/cart", authenticateToken, addToCart);

module.exports = router;

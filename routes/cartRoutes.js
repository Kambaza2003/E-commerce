const express = require("express");

const {
    addToCart,
    getMyCart,
    updateCart,
    deleteCartItem
 } = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/cart", authenticateToken, addToCart);
router.get("/cart", authenticateToken, getMyCart);
router.put("/cart/:id", authenticateToken, updateCart);
router.delete("/cart/:id", authenticateToken, deleteCartItem);

module.exports = router;

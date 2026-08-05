const express = require("express");

const {
    addOrder,
    getMyOrders,
    getOrderById
 } = require("../controllers/orderController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/orders", authenticateToken, addOrder);
router.get("/orders", authenticateToken, getMyOrders);
router.get("/orders/:id", authenticateToken, getOrderById);

module.exports = router;
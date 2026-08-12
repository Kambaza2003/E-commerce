const express = require("express");

const {
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders
 } = require("../controllers/orderController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeAdmin");

const router = express.Router();

router.get("/orders", authenticateToken, getMyOrders);
router.get("/orders/:id", authenticateToken, getOrderById);
router.put("/orders/:id/status", authenticateToken, authorizeAdmin, updateOrderStatus);
router.get("/admin/orders", authenticateToken, authorizeAdmin, getAllOrders);

module.exports = router;
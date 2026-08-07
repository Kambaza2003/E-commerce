const express = require("express");

const {
    addOrder,
    getMyOrders,
    getOrderById,
    updateOrder,
    deleteOrder
 } = require("../controllers/orderController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/orders", authenticateToken, addOrder);
router.get("/orders", authenticateToken, getMyOrders);
router.get("/orders/:id", authenticateToken, getOrderById);
router.put("/orders/:id", authenticateToken, updateOrder);
router.delete("/orders/:id", authenticateToken, deleteOrder);

module.exports = router;
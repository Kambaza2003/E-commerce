const express = require("express");

const {
    createPayment,
    payPayment
} = require("../controllers/paymentController");

const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/payments/:orderId", authenticateToken, createPayment);
router.post("/payments/:paymentId/pay", authenticateToken, payPayment);

module.exports = router;
const express = require("express");

const {
    createPayment,
    payPayment,
    getAllPayments
} = require("../controllers/paymentController");

const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeAdmin");


const router = express.Router();

router.post("/payments/:orderId", authenticateToken, createPayment);
router.post("/payments/reference/:reference/pay", authenticateToken, payPayment);
router.get("/admin/payments", authenticateToken, authorizeAdmin, getAllPayments);

module.exports = router;
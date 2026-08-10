const express = require("express");

const {
    getCheckout,
    completeCheckout
} = require("../controllers/checkoutController");

const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getCheckout);
router.post("/", authenticateToken, completeCheckout);

module.exports = router;
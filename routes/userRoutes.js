const express = require("express");

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getAllUsers
} = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authMiddleware");

const { authorizeAdmin } = require("../middlewares/authorizeAdmin");

const router = express.Router();

router.post("/user/register", registerUser);

router.post("/user/login", loginUser);

router.post("/user/forgot-password", forgotPassword);

router.post("/user/reset-password", resetPassword);

router.get("/admin/users", authenticateToken, authorizeAdmin, getAllUsers);

module.exports = router;
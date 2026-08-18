const express = require("express");

const {
    registerUser,
    loginUser,
    getAllUsers
} = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeAdmin");

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/admin/users", authenticateToken, authorizeAdmin, getAllUsers);

module.exports = router
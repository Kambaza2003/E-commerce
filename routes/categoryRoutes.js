const express = require("express");

const {
    getCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeAdmin");

const router = express.Router();

router.get("/categories", getCategories);

router.get("/categories/:id", getCategoryById);

router.post("/categories", authenticateToken, authorizeAdmin, addCategory);

router.put("/categories/:id", authenticateToken, authorizeAdmin, updateCategory);

router.delete("/categories/:id", authenticateToken, authorizeAdmin, deleteCategory);

module.exports = router;
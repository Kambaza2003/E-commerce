const express = require("express");

const {
    getCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", addCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory)

module.exports = router;
const express = require("express");

const { 
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsWithCategory,
    getProductsByCategoryId
 } = require("../controllers/productController");

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/with-category", getProductsWithCategory);
router.get("/products/category/:categoryId", getProductsByCategoryId);
router.get("/products/:id", getProductById);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
    getProductImages
} = require("../controllers/productImagesController");

router.get("/:productId", getProductImages);

module.exports = router;
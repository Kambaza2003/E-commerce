const {
    getProductImagesModel
} = require("../models/productImagesModel");

const getProductImages = async (req, res) => {

    try {

        const productId = parseInt(req.params.productId);

        const images = await getProductImagesModel(productId);

        res.status(200).json(images);

    } catch (error) {

        console.error(
            "Error fetching product images:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch product images"
        });

    }

};

module.exports = {
    getProductImages
};
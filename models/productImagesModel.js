const pool = require("../config/db");

const getProductImagesModel = async (productId) => {

    const [rows] = await pool.query(
        `SELECT id, product_id, image
         FROM product_images
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
    );

    return rows;
};

module.exports = {
    getProductImagesModel
};
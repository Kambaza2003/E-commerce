const pool = require("../config/db");

const getCartItemModel = async (userId, productId) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM cart
         WHERE user_id = ?
         AND product_id = ?;`,
         [userId, productId]
    );

    return rows;
};

const addToCartModel = async (userId, productId, quantity) => {
    const [result] = await pool.query(
        `INSERT INTO cart (user_id, product_id, quantity)
         VALUES (?, ?, ?);`,
         [userId, productId, quantity]
    );

    return result;
};

const updateCartQuantityModel = async (cartId, quantity) => {
    const [result] = await pool.query(
        `UPDATE cart
         SET quantity = ?
         WHERE id = ?;`,
         [quantity, cartId]
    );

    return result;
};

module.exports ={
    getCartItemModel, 
    addToCartModel,
    updateCartQuantityModel
}
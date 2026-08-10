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

const updateCartQuantityModel = async (cartId, userId, quantity) => {
    const [result] = await pool.query(
        `UPDATE cart
         SET quantity = ?
         WHERE id = ?
         AND user_id = ?`,
        [quantity, cartId, userId]
    );

    return result;
};

const getCartByUserIdModel = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            cart.id,
            cart.product_id,
            products.name,
            products.price,
            cart.quantity,
            cart.created_at
            
        FROM cart
        JOIN products
            ON cart.product_id = products.id
        WHERE cart.user_id = ?;`,
        [userId]
    );

    return rows;
};

const deleteCartItemModel = async (cartId, userId) => {
    const [result] = await pool.query(
        `DELETE FROM cart
         WHERE id = ?
         AND user_id = ?;`,
        [cartId, userId]
    );

    return result;
};

module.exports ={
    getCartItemModel, 
    addToCartModel,
    updateCartQuantityModel,
    getCartByUserIdModel,
    deleteCartItemModel
}
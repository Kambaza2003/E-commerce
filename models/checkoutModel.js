const pool = require("../config/db");

const createOrderFromCartModel = async (userId, productId, quantity) => {
    const [result] = await pool.query(
        `INSERT INTO orders (user_id, product_id, quantity)
         VALUES (?, ?, ?);`,
        [userId, productId, quantity]
    );

    return result;
};

const clearCartModel = async (userId) => {
    const [result] = await pool.query(
        `DELETE FROM cart
         WHERE user_id = ?;`,
        [userId]
    );

    return result;
};

module.exports = {
    createOrderFromCartModel,
    clearCartModel
};
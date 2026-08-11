const pool = require("../config/db");

const createOrderFromCartModel = async ( connection, userId, productId, quantity) => {
    const [result] = await connection.query(
        `INSERT INTO orders (user_id, product_id, quantity)
         VALUES (?, ?, ?);`,
        [userId, productId, quantity]
    );

    return result;
};

const clearCartModel = async (connection, userId) => {
    const [result] = await connection.query(
        `DELETE FROM cart
         WHERE user_id = ?;`,
        [userId]
    );

    return result;
};

const getTransactionConnection = async () => {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    return connection;
};

module.exports = {
    createOrderFromCartModel,
    clearCartModel, 
    getTransactionConnection
};
const pool = require("../config/db");

const createPaymentModel = async (orderId, amount) => {
    const [result] = await pool.query(
        `INSERT INTO payments (order_id, amount)
         VALUES (?, ?)`,
        [orderId, amount]
    );

    return result;
};

const getOrderForPaymentModel = async (orderId, userId) => {
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            orders.user_id,
            orders.quantity,
            orders.status,
            products.price
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         WHERE orders.id = ?
         AND orders.user_id = ?`,
        [orderId, userId]
    );

    return rows;
};

const getPaymentByOrderIdModel = async (orderId) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            order_id,
            amount,
            status,
            created_at
         FROM payments
         WHERE order_id = ?`,
        [orderId]
    );

    return rows;
};

const getPaymentForUserModel = async (paymentId, userId) => {
    const [rows] = await pool.query(
        `SELECT
            payments.id,
            payments.order_id,
            payments.amount,
            payments.status,
            orders.user_id
         FROM payments
         JOIN orders
            ON payments.order_id = orders.id
         WHERE payments.id = ?
         AND orders.user_id = ?`,
        [paymentId, userId]
    );

    return rows;
};

const updatePaymentStatusModel = async (connection, paymentId, status) => {
    const [result] = await connection.query(
        `UPDATE payments
         SET status = ?
         WHERE id = ?`,
        [status, paymentId]
    );

    return result;
};

module.exports = {
    createPaymentModel,
    getOrderForPaymentModel,
    getPaymentByOrderIdModel,
    getPaymentForUserModel,
    updatePaymentStatusModel
};
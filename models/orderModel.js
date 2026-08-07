const pool = require("../config/db");

const addOrderModel = async (userId, productId, quantity) => {
    const [result] = await pool.query(
        `INSERT INTO orders (user_id, product_id, quantity)
        VALUES (?, ?, ?)`,
        [userId, productId, quantity]
    );

    return result;
};

const getOrdersByUserIdModel = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            products.name,
            products.price,
            orders.quantity,
            orders.created_at
        FROM orders
        JOIN products
            ON orders.product_id = products.id
        WHERE orders.user_id = ?
        ORDER BY orders.created_at DESC;`,
        [userId]
    );

    return rows;
};

const getOrderByIdModel = async (orderId, userId) =>{
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            products.name,
            products.price,
            orders.quantity,
            orders.created_at
        FROM orders
        JOIN products
            ON orders.product_id = products.id
        WHERE orders.id = ?
        AND orders.user_id = ?;`,
        [orderId, userId]
    );

    return rows;
};

const updateOrderModel = async (orderId, userId, quantity) => {
    const [result] = await pool.query(
        `UPDATE orders
         SET quantity = ?
         WHERE id = ?
         AND user_id = ?`,
         [quantity, orderId, userId]
    );

    return result;
   
};

const deleteOrderModel = async (orderId, userId) => {
    const [result] = await pool.query(
        `DELETE FROM orders
         WHERE id = ?
         AND user_id = ?;`,
         [orderId, userId]
    );

    return result;
}

module.exports ={
    addOrderModel,
    getOrdersByUserIdModel,
    getOrderByIdModel, 
    updateOrderModel,
    deleteOrderModel
}
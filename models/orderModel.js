const pool = require("../config/db");

const getOrdersByUserIdModel = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            products.name,
            products.price,
            orders.quantity,
            orders.status,
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

const getOrderByIdModel = async (orderId, userId) => {
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            products.name,
            products.price,
            products.image,
            orders.quantity,
            orders.status,
            orders.created_at
        FROM orders
        JOIN products
            ON orders.product_id = products.id
        WHERE orders.id = ?
        AND orders.user_id = ?
        LIMIT 1;`,
        [orderId, userId]
    );

    return rows;
};

const updateOrderStatusModel = async (orderId, status) => {
    const [result] = await pool.query(
        `UPDATE orders
         SET status = ?
         WHERE id = ?
         AND status NOT IN ('shipped', 'delivered', 'cancelled');`,
        [status, orderId]
    );

    return result;
};

const cancelOrderModel = async (orderId, userId) => {
    const [result] = await pool.query(
        `UPDATE orders
         SET status = 'cancelled'
         WHERE id = ? 
         AND user_id = ? 
         AND status = 'pending';`, 
        [orderId, userId]
    ); 
    
    return result; 
};

const getAllOrdersModel = async () => {
    const [rows] = await pool.query(
        `SELECT
            orders.id,
            orders.user_id,
            orders.product_id,
            products.name,
            products.price,
            orders.quantity,
            orders.status,
            orders.created_at
         FROM orders
         JOIN products
            ON orders.product_id = products.id
         ORDER BY orders.created_at DESC;`
    );

    return rows;
};

const updateOrderStatusWithConnectionModel = async (connection, orderId, status) => {
    const [result] = await connection.query(
        `UPDATE orders
         SET status = ?
         WHERE id = ?`,
        [status, orderId]
    );

    return result;
};

module.exports ={
    getOrdersByUserIdModel,
    getOrderByIdModel, 
    updateOrderStatusModel,
    cancelOrderModel,
    getAllOrdersModel,
    updateOrderStatusWithConnectionModel    
}
const pool = require("../config/db");

const getProductsModel = async () => {
    const [rows] = await pool.query("SELECT * FROM products");

    return rows;
};

const getProductByIdModel = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    return rows;
};

const addProductModel = async (
    name,
    description,
    price,
    stock,
    image,
    category_id
) => {
    const [result] = await pool.query(
        `INSERT INTO products
        (name, description, price, stock, image, category_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, price, stock, image, category_id]
    );

    return result;
};

const updateProductModel = async (
    id,
    name,
    description,
    price,
    stock,
    image,
    category_id
) => {
    const [result] = await pool.query(
        `UPDATE products
         SET name = ?,
             description = ?,
             price = ?,
             stock = ?,
             image = ?,
             category_id = ?
         WHERE id = ?`,
        [
            name,
            description,
            price,
            stock,
            image,
            category_id,
            id
        ]
    );

    return result;
};

const deleteProductModel = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM products WHERE id = ?",
        [id]
    );

    return result;
};

const getProductsWithCategoryModel = async () => {
    const [rows] = await pool.query(`
        SELECT
            products.id,
            products.name,
            products.price,
            categories.name AS category
        FROM products
        JOIN categories
            ON products.category_id = categories.id
    `);

    return rows;
};

const getProductsByCategoryIdModel = async (categoryId) => {
    const [rows] = await pool.query(`
        SELECT
            products.id,
            products.name,
            products.price,
            categories.name AS category
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        WHERE categories.id = ?`,
        [categoryId]
    );
    

    return rows;
}

const getProductStockModel = async (productId) => {
    const [rows] = await pool.query(
        `SELECT stock
         FROM products
         WHERE id = ?`,
        [productId]
    );

    return rows;
};

const reduceProductStockModel = async (connection, productId, quantity) => {
    const [result] = await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?
         AND stock >= ?`,
        [quantity, productId, quantity]
    );

    return result;
};

module.exports = {
    getProductsModel,
    getProductByIdModel,
    addProductModel,
    updateProductModel,
    deleteProductModel,
    getProductsWithCategoryModel,
    getProductsByCategoryIdModel,
    getProductStockModel,
    reduceProductStockModel
};
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

module.exports = {
    getProductsModel,
    getProductByIdModel,
    addProductModel,
    updateProductModel,
    deleteProductModel
};
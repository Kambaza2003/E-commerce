const pool = require("../config/db");

const getProductsModel = async (filters = {}) => {

    let query = `
        SELECT
            products.*,
            categories.name AS category_name
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        WHERE 1 = 1
    `;

    const values = [];

    if (filters.search) {

        query += `
            AND (
                products.name LIKE ?
                OR products.description LIKE ?
            )
        `;

        const searchValue = `%${filters.search}%`;

        values.push(searchValue, searchValue);
    }

    if (filters.category) {

        query += `
            AND products.category_id = ?
        `;

        values.push(filters.category);
    }

    if (filters.minPrice !== undefined) {

        query += `
            AND products.price >= ?
        `;

        values.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {

        query += `
            AND products.price <= ?
        `;

        values.push(filters.maxPrice);
    }

    if (filters.sort === "price_asc") {

        query += ` ORDER BY products.price ASC`;

    } else if (filters.sort === "price_desc") {

        query += ` ORDER BY products.price DESC`;

    } else if (filters.sort === "name_asc") {

        query += ` ORDER BY products.name ASC`;

    } else if (filters.sort === "name_desc") {

        query += ` ORDER BY products.name DESC`;

    } else {

        query += ` ORDER BY products.id DESC`;
    }

    const [rows] = await pool.query(query, values);

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
            products.description,
            products.price,
            products.stock,
            products.image,
            products.category_id,
            categories.name AS category_name
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        ORDER BY products.id DESC
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
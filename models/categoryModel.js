const pool = require("../config/db");

const getCategoriesModel = async () => {
    const [rows] = await pool.query("SELECT * FROM categories");

    return rows;
};

const getCategoryByIdModel = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM categories WHERE id = ?",
        [id]
    );

    return rows;
};

const addCategoryModel = async (name) => {
    const [result] = await pool.query(
        `INSERT INTO categories (name) VALUES (?)`,
        [name]
    );

    return result;
};

const updateCategoryModel = async ( id, name ) => {
    const [result] = await pool.query(
        `UPDATE categories
         SET name = ?
         WHERE id = ?`,
        [name, id]
    );

    return result;
};

const deleteCategoryModel = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM categories WHERE id = ?",
        [id]
    );

    return result;
};

module.exports = {
    getCategoriesModel,
    getCategoryByIdModel,
    addCategoryModel,
    updateCategoryModel,
    deleteCategoryModel
};
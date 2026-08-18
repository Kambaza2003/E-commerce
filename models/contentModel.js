const pool = require("../config/db");


const getAllContentModel = async () => {

    const [rows] = await pool.query(
        `SELECT
            id,
            page,
            section,
            title,
            content,
            updated_at
         FROM page_content
         ORDER BY page, id`
    );

    return rows;
};


const getContentByIdModel = async (id) => {

    const [rows] = await pool.query(
        `SELECT
            id,
            page,
            section,
            title,
            content,
            updated_at
         FROM page_content
         WHERE id = ?`,
        [id]
    );

    return rows;
};


const addContentModel = async (
    page,
    section,
    title,
    content
) => {

    const [result] = await pool.query(
        `INSERT INTO page_content
            (page, section, title, content)
         VALUES (?, ?, ?, ?)`,
        [
            page,
            section,
            title,
            content
        ]
    );

    return result;
};


const updateContentModel = async (
    id,
    page,
    section,
    title,
    content
) => {

    const [result] = await pool.query(
        `UPDATE page_content
         SET
            page = ?,
            section = ?,
            title = ?,
            content = ?
         WHERE id = ?`,
        [
            page,
            section,
            title,
            content,
            id
        ]
    );

    return result;
};

const getContentByPageModel = async (page) => {

    const [rows] = await pool.query(
        `SELECT
            id,
            page,
            section,
            title,
            content
         FROM page_content
         WHERE page = ?
         ORDER BY id ASC`,
        [page]
    );

    return rows;
};

module.exports = {
    getAllContentModel,
    getContentByIdModel,
    addContentModel,
    updateContentModel,
    getContentByPageModel
};
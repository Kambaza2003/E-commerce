const pool = require("../config/db");

const addUserModel = async (name, email, password) => {
    const [result] = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES (?, ?, ?)`,
        [name, email, password]
    );

    return result;
};

const getUserByEmailModel = async (email) => {
    const [rows] = await pool.query(
        `SELECT * FROM users
         WHERE email = ?`,
        [email]
    );

    return rows;
};

const getAllUsersModel = async () => {
    const [rows] = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            created_at
         FROM users
         ORDER BY created_at DESC`
    );

    return rows;
};

module.exports = {
    addUserModel,
    getUserByEmailModel,
    getAllUsersModel
}
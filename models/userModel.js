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

module.exports = {
    addUserModel,
    getUserByEmailModel
}
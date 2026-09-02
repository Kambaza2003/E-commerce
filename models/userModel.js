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

const saveResetTokenModel = async (
    email,
    resetToken,
    resetTokenExpires
) => {

    const [result] = await pool.query(
        `UPDATE users
         SET reset_token = ?,
             reset_token_expires = ?
         WHERE email = ?`,
        [
            resetToken,
            resetTokenExpires,
            email
        ]
    );

    return result;
};


const getUserByResetTokenModel = async (resetToken) => {

    const [rows] = await pool.query(
        `SELECT *
         FROM users
         WHERE reset_token = ?
         AND reset_token_expires > NOW()`,
        [resetToken]
    );

    return rows;
};


const updatePasswordModel = async (
    userId,
    hashedPassword
) => {

    const [result] = await pool.query(
        `UPDATE users
         SET password = ?,
             reset_token = NULL,
             reset_token_expires = NULL
         WHERE id = ?`,
        [
            hashedPassword,
            userId
        ]
    );

    return result;
};

module.exports = {
    addUserModel,
    getUserByEmailModel,
    saveResetTokenModel,
    getUserByResetTokenModel,
    updatePasswordModel,
    getAllUsersModel
}
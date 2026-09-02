const pool = require("../config/db");


const createContactMessageModel = async (
    name,
    email,
    message
) => {

    const [result] = await pool.query(
        `INSERT INTO contact_messages
        (name, email, message)
        VALUES (?, ?, ?)`,
        [
            name,
            email,
            message
        ]
    );

    return result;
};


const getAllContactMessagesModel = async () => {

    const [rows] = await pool.query(
        `SELECT *
         FROM contact_messages
         ORDER BY created_at DESC`
    );

    return rows;
};


module.exports = {
    createContactMessageModel,
    getAllContactMessagesModel
};

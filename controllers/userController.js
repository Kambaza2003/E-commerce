const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
    addUserModel,
    getUserByEmailModel,
    saveResetTokenModel,
    getUserByResetTokenModel,
    updatePasswordModel,
    getAllUsersModel
} = require("../models/userModel");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await getUserByEmailModel(email);

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await addUserModel(
            name,
            email,
            hashedPassword
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const users = await getUserByEmailModel(email);

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const users = await getUserByEmailModel(email);

        /*
         * Always return the same response whether
         * the email exists or not.
         */
        if (users.length === 0) {
            return res.status(200).json({
                message:
                    "If an account with that email exists, a password reset link will be sent."
            });
        }

        const user = users[0];

        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await saveResetTokenModel(
            email,
            resetToken,
            resetTokenExpires
        );

        console.log(
            `Password reset token for ${user.email}: ${resetToken}`
        );

        res.status(200).json({
            message:
                "If an account with that email exists, a password reset link will be sent.",
            resetToken
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


const resetPassword = async (req, res) => {
    try {

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });
        }

        const users =
            await getUserByResetTokenModel(token);

        if (users.length === 0) {
            return res.status(400).json({
                message:
                    "Invalid or expired password reset token"
            });
        }

        const user = users[0];

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await updatePasswordModel(
            user.id,
            hashedPassword
        );

        res.status(200).json({
            message:
                "Password reset successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersModel();

        res.status(200).json({
            users
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getAllUsers
}
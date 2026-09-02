const express = require("express");

const {
    createContactMessage,
    getAllContactMessages
} = require("../controllers/contactController");

const {
    authenticateToken
} = require("../middlewares/authMiddleware");

const {
    authorizeAdmin
} = require("../middlewares/authorizeAdmin");


const router = express.Router();


// USER — SEND MESSAGE

router.post(
    "/contact",
    createContactMessage
);


// ADMIN — VIEW MESSAGES

router.get(
    "/admin/contact-messages",
    authenticateToken,
    authorizeAdmin,
    getAllContactMessages
);


module.exports = router;

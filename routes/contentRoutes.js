const express = require("express");

const {
    getAllContent,
    getContentById,
    addContent,
    updateContent,
    getPublicContentByPage
} = require("../controllers/contentController");

const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeAdmin");


const router = express.Router();

router.get("/admin/content", authenticateToken, authorizeAdmin, getAllContent);
router.get("/admin/content/:id", authenticateToken, authorizeAdmin, getContentById);
router.post("/admin/content", authenticateToken, authorizeAdmin, addContent);
router.put("/admin/content/:id", authenticateToken, authorizeAdmin, updateContent);
router.get("/content/:page", getPublicContentByPage);

module.exports = router;
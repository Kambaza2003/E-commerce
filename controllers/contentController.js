const {
    getAllContentModel,
    getContentByIdModel,
    addContentModel,
    updateContentModel,
    getContentByPageModel
} = require("../models/contentModel");


const getAllContent = async (req, res) => {

    try {

        const content =
            await getAllContentModel();

        return res.status(200).json(content);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


const getContentById = async (req, res) => {

    try {

        const id =
            parseInt(req.params.id, 10);

        if (isNaN(id)) {

            return res.status(400).json({
                message: "Invalid Content ID"
            });

        }

        const content =
            await getContentByIdModel(id);

        if (content.length === 0) {

            return res.status(404).json({
                message: "Content not found"
            });

        }

        return res.status(200).json(
            content[0]
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


const addContent = async (req, res) => {

    try {

        const {
            page,
            section,
            title,
            content
        } = req.body;


        if (!page || !section || !content) {

            return res.status(400).json({
                message: "Page, section and content are required"
            });

        }


        const result =
            await addContentModel(
                page,
                section,
                title,
                content
            );


        return res.status(201).json({
            message: "Content added successfully",
            contentId: result.insertId
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


const updateContent = async (req, res) => {

    try {

        const id =
            parseInt(req.params.id, 10);


        const {
            page,
            section,
            title,
            content
        } = req.body;


        if (isNaN(id)) {

            return res.status(400).json({
                message: "Invalid Content ID"
            });

        }


        if (!page || !section || !content) {

            return res.status(400).json({
                message: "Page, section and content are required"
            });

        }


        const existingContent =
            await getContentByIdModel(id);


        if (existingContent.length === 0) {

            return res.status(404).json({
                message: "Content not found"
            });

        }


        const result =
            await updateContentModel(
                id,
                page,
                section,
                title,
                content
            );


        return res.status(200).json({
            message: "Content updated successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

const getPublicContentByPage = async (req, res) => {

    try {

        const page = req.params.page;

        if (!page) {

            return res.status(400).json({
                message: "Page is required"
            });

        }

        const allowedPages = [
            "home",
            "about",
            "contact"
        ];

        if (!allowedPages.includes(page)) {

            return res.status(400).json({
                message: "Invalid page"
            });

        }

        const content =
            await getContentByPageModel(page);

        return res.status(200).json(content);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    getAllContent,
    getContentById,
    addContent,
    updateContent,
    getPublicContentByPage
};
const {
    createContactMessageModel,
    getAllContactMessagesModel
} = require("../models/contactModel");


const createContactMessage = async (req, res) => {

    try {

        const {
            name,
            email,
            message
        } = req.body;


        if (!name || !email || !message) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        await createContactMessageModel(
            name,
            email,
            message
        );


        res.status(201).json({
            message: "Message sent successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


const getAllContactMessages = async (req, res) => {

    try {

        const messages =
            await getAllContactMessagesModel();


        res.status(200).json(messages);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


module.exports = {
    createContactMessage,
    getAllContactMessages
};

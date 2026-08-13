const {
    createPaymentModel,
    getOrderForPaymentModel,
    getPaymentByOrderIdModel,
    getPaymentForUserModel,
    updatePaymentStatusModel
} = require("../models/paymentModel");

const {
    updateOrderStatusWithConnectionModel
} = require("../models/orderModel");

const {
    getTransactionConnection
} = require("../models/checkoutModel");

const createPayment = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        const { amount } = req.body;
        const paymentAmount = Number(amount);
        const userId = req.user.id;

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        if (isNaN(orderId)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        const orders = await getOrderForPaymentModel(
            orderId,
            userId
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const order = orders[0];

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Payment cannot be created for this order"
            });
        }

        const expectedAmount = Number(order.price) * order.quantity;

        if (paymentAmount !== expectedAmount) {
            return res.status(400).json({
                message: "Payment amount does not match order amount"
            });
        }

        const existingPayments = await getPaymentByOrderIdModel(orderId);

        if (existingPayments.length > 0) {
            return res.status(400).json({
                message: "Payment already exists for this order"
            });
        }

        const result = await createPaymentModel(
            orderId,
            paymentAmount
        );

        return res.status(201).json({
            message: "Payment created successfully",
            paymentId: result.insertId
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const payPayment = async (req, res) => {
    let connection;

    try {
        const paymentId = parseInt(req.params.paymentId, 10);
        const userId = req.user.id;

        if (isNaN(paymentId)) {
            return res.status(400).json({
                message: "Invalid Payment ID"
            });
        }

        const payments = await getPaymentForUserModel(
            paymentId,
            userId
        );

        if (payments.length === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        const payment = payments[0];

        if (payment.status !== "pending") {
            return res.status(400).json({
                message: "Payment cannot be processed"
            });
        }

        connection = await getTransactionConnection();

        await updatePaymentStatusModel(
            connection,
            paymentId,
            "successful"
        );

        await updateOrderStatusWithConnectionModel(
            connection,
            payment.order_id,
            "processing"
        );

        await connection.commit();

        return res.status(200).json({
            message: "Payment successful"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createPayment,
    payPayment
};
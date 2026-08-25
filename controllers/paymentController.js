const {
    createPaymentModel,
    getOrderForPaymentModel,
    getPaymentByOrderIdModel,
    getPaymentForUserModel,
    updatePaymentStatusModel,
    getAllPaymentsModel,
    getPaymentByReferenceForUserModel
} = require("../models/paymentModel");

const {
    updateOrderStatusWithConnectionModel
} = require("../models/orderModel");

const {
    getTransactionConnection
} = require("../models/checkoutModel");

const {
    initializeTransaction,
    verifyTransaction
} = require("../services/paystackService");

const createPayment = async (req, res) => {

    try {

        const orderId = parseInt(req.params.orderId, 10);
        const userId = req.user.id;

        if (isNaN(orderId)) {

            return res.status(400).json({
                message: "Invalid Order ID"
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


        const expectedAmount =
            Number(order.price) *
            Number(order.quantity);


        const amountInKobo =
            Math.round(expectedAmount * 100);

        const existingPayments =
            await getPaymentByOrderIdModel(orderId);


        if (existingPayments.length > 0) {

            const existingPayment =
                existingPayments[0];


            if (existingPayment.status === "successful") {

                return res.status(400).json({
                    message: "This order has already been paid"
                });

            }


            /*
            * If the payment is still pending,
            * check its status directly with Paystack.
            */

            if (existingPayment.status === "pending") {

                const paystackResponse =
                    await verifyTransaction(
                        existingPayment.reference
                    );


                if (
                    paystackResponse.status &&
                    paystackResponse.data.status === "success"
                ) {

                    return res.status(400).json({
                        message: "Payment was already completed. Please refresh your orders."
                    });

                }

                /*
                * The existing payment has not
                * succeeded, so allow a new attempt.
                *
                * We will create a new reference below.
                */

            }

        }    

        /*
         * Create a unique reference
         */

        const reference =
            `PC_HUB_${orderId}_${Date.now()}`;


        /*
         * Initialize transaction with Paystack
         */

        const callbackUrl =
            `http://127.0.0.1:5501/frontend/payment-callback.html`;

        const paystackResponse =
            await initializeTransaction(
                req.user.email,
                amountInKobo,
                reference,
                callbackUrl
            );

        if (!paystackResponse.status) {

            return res.status(400).json({
                message:
                    paystackResponse.message ||
                    "Unable to initialize payment"
            });

        }


        /*
         * Save payment in database
         */

        const result =
            await createPaymentModel(
                orderId,
                expectedAmount,
                reference
            );


        return res.status(201).json({

            message: "Payment initialized successfully",

            paymentId: result.insertId,

            reference,

            authorization_url:
                paystackResponse.data.authorization_url

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Unable to initialize payment"
        });

    }

};

const payPayment = async (req, res) => {

    let connection;

    try {

        const reference =
            req.params.reference;

        const userId =
            req.user.id;


        if (!reference) {

            return res.status(400).json({
                message: "Payment reference is required"
            });

        }
        /*
         * Find the payment and make sure
         * it belongs to the logged-in user.
         */

        const payments =
            await getPaymentByReferenceForUserModel(
                reference,
                userId
            );

        if (payments.length === 0) {

            return res.status(404).json({
                message: "Payment not found"
            });

        }


        const payment =
            payments[0];


        if (payment.status !== "pending") {

            return res.status(400).json({
                message: "Payment cannot be processed"
            });

        }


        /*
         * Verify the transaction with Paystack.
         */

        const paystackResponse =
            await verifyTransaction(
                payment.reference
            );


        if (!paystackResponse.status) {

            return res.status(400).json({
                message:
                    paystackResponse.message ||
                    "Unable to verify payment"
            });

        }


        const transaction =
            paystackResponse.data;


        /*
         * Make sure Paystack actually
         * reports the transaction as successful.
         */

        if (transaction.status !== "success") {

            return res.status(400).json({
                message: "Payment was not successful"
            });

        }


        /*
         * Make sure the amount paid matches
         * the amount stored in our database.
         *
         * Paystack amount is in kobo.
         */

        const expectedAmount =
            Math.round(
                Number(payment.amount) * 100
            );


        if (
            Number(transaction.amount) !==
            expectedAmount
        ) {

            return res.status(400).json({
                message: "Payment amount mismatch"
            });

        }


        /*
         * Start database transaction.
         */

        connection =
            await getTransactionConnection();


        /*
         * Update payment status.
         */

        await updatePaymentStatusModel(
            connection,
            payment.id,
            "successful"
        );


        /*
         * Update order status.
         */

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

            message:
                "Unable to verify payment"

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};

const getAllPayments = async (req, res) => {
    try {

        const payments = await getAllPaymentsModel();

        return res.status(200).json({
            payments
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    createPayment,
    payPayment,
    getAllPayments
};
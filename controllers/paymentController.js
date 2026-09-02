const {
    createPaymentModel,
    getOrderForPaymentModel,
    getPaymentByOrderIdModel,
    getPaymentForUserModel,
    updatePaymentStatusModel,
    getAllPaymentsModel,
    getPaymentByReferenceForUserModel,
    getPaymentByReferenceModel
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

    let connection;

    try {

        const orderId =
            parseInt(req.params.orderId, 10);

        const userId =
            req.user.id;


        if (isNaN(orderId)) {

            return res.status(400).json({
                message: "Invalid Order ID"
            });

        }


        /*
        * Get a database connection.
        *
        * We use this connection to lock the order
        * while the payment is being initialized.
        */

        connection =
            await getTransactionConnection();


        /*
        * Lock this order.
        *
        * Any second payment request for the same
        * order must wait until this transaction
        * finishes.
        */

        const [orders] =
            await connection.query(
                `SELECT
                    id,
                    user_id,
                    price,
                    quantity,
                    status
                FROM orders
                WHERE id = ?
                FOR UPDATE`,
                [orderId]
            );


        if (orders.length === 0) {

            await connection.rollback();

            connection.release();
            connection = null;

            return res.status(404).json({
                message: "Order not found"
            });

        }


        const order =
            orders[0];


        /*
        * Make sure the order belongs to
        * the logged-in user.
        */

        if (Number(order.user_id) !== Number(userId)) {

            await connection.rollback();

            connection.release();
            connection = null;

            return res.status(404).json({
                message: "Order not found"
            });

        }


        /*
        * Payment can only be created while
        * the order is still pending.
        */

        if (order.status !== "pending") {

            await connection.rollback();

            connection.release();
            connection = null;

            return res.status(400).json({
                message:
                    "Payment cannot be created for this order"
            });

        }


        const expectedAmount =
            Number(order.price) *
            Number(order.quantity);


        const amountInKobo =
            Math.round(expectedAmount * 100);


        /*
        * Check existing payments while the order
        * is locked.
        */

        const [existingPayments] =
            await connection.query(
                `SELECT
                    id,
                    order_id,
                    amount,
                    reference,
                    status,
                    created_at
                FROM payments
                WHERE order_id = ?
                ORDER BY id DESC`,
                [orderId]
            );


        if (existingPayments.length > 0) {

            const existingPayment =
                existingPayments[0];


            /*
            * If the order already has a successful
            * payment, do not create another one.
            */

            if (existingPayment.status === "successful") {

                await connection.rollback();

                connection.release();
                connection = null;

                return res.status(400).json({
                    message:
                        "This order has already been paid"
                });

            }


            /*
            * If there is already a pending payment,
            * verify it with Paystack and reuse it.
            */

            if (existingPayment.status === "pending") {

                const paystackResponse =
                    await verifyTransaction(
                        existingPayment.reference
                    );


                /*
                * Paystack says the existing transaction
                * was successful.
                */

                if (
                    paystackResponse.status &&
                    paystackResponse.data.status === "success"
                ) {

                    await connection.rollback();

                    connection.release();
                    connection = null;

                    return res.status(400).json({
                        message:
                            "Payment was already completed. Please refresh your orders."
                    });

                }


                /*
                * The existing payment is still pending.
                * Reuse it.
                */

                await connection.rollback();

                connection.release();
                connection = null;

                return res.status(200).json({

                    message:
                        "A payment is already pending for this order.",

                    paymentId:
                        existingPayment.id,

                    reference:
                        existingPayment.reference

                });

            }

        }


        /*
        * Create a new unique Paystack reference.
        */

        const reference =
            `PC_HUB_${orderId}_${Date.now()}`;


        /*
        * Paystack callback URL.
        */

        const callbackUrl =
            `https://pc-hub-frontend.onrender.com/payment-callback.html`;


        /*
        * Initialize Paystack while the order is locked.
        *
        * This prevents another request from
        * initializing another Paystack transaction
        * for the same order.
        */

        const paystackResponse =
            await initializeTransaction(
                req.user.email,
                amountInKobo,
                reference,
                callbackUrl
            );


        if (!paystackResponse.status) {

            await connection.rollback();

            connection.release();
            connection = null;

            return res.status(400).json({
                message:
                    paystackResponse.message ||
                    "Unable to initialize payment"
            });

        }


        /*
        * Save the payment using the SAME database
        * connection and transaction.
        */

        const [result] =
            await connection.query(
                `INSERT INTO payments
                (order_id, amount, reference)
                VALUES (?, ?, ?)`,
                [
                    orderId,
                    expectedAmount,
                    reference
                ]
            );


        /*
        * Commit the payment record and release
        * the order lock.
        */

        await connection.commit();


        connection.release();
        connection = null;


        return res.status(201).json({

            message:
                "Payment initialized successfully",

            paymentId:
                result.insertId,

            reference,

            authorization_url:
                paystackResponse.data.authorization_url

        });

    } catch (error) {

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError
                );

            }

            connection.release();

        }


        console.error(
            "Create payment error:",
            error
        );


        return res.status(500).json({
            message:
                "Unable to initialize payment"
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


        if (payment.status === "successful") {

            return res.status(200).json({
                message: "Payment successful"
            });

        }

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

const crypto = require("crypto");

const paystackWebhook = async (req, res) => {

    let connection;

    try {

        /*
         * Get Paystack's signature.
         */
        const signature =
            req.headers["x-paystack-signature"];

        if (!signature) {

            return res.status(401).json({
                message: "Missing Paystack signature"
            });

        }


        /*
         * Verify that the request actually
         * came from Paystack.
         */
        const hash = crypto
            .createHmac(
                "sha512",
                process.env.PAYSTACK_SECRET_KEY
            )
            .update(req.rawBody)
            .digest("hex");


        const hashBuffer =
            Buffer.from(hash, "hex");

        const signatureBuffer =
            Buffer.from(signature, "hex");

        if (
            hashBuffer.length !== signatureBuffer.length ||
            !crypto.timingSafeEqual(
                hashBuffer,
                signatureBuffer
            )
        ) {

            return res.status(401).json({
                message: "Invalid Paystack signature"
            });

        }


        /*
         * Paystack sends different event types.
         * We only process successful charges.
         */
        if (req.body.event !== "charge.success") {

            return res.status(200).json({
                message: "Event received"
            });

        }


        const transaction =
            req.body.data;


        if (!transaction || !transaction.reference) {

            return res.status(400).json({
                message: "Invalid webhook data"
            });

        }


        const reference =
            transaction.reference;


        /*
         * Find the payment using the Paystack
         * transaction reference.
         */
        const payments =
            await getPaymentByReferenceModel(reference);

        /*
         * The webhook may arrive for a transaction
         * that our system does not know about.
         *
         * Acknowledge it so Paystack does not
         * repeatedly retry the webhook.
         */
        if (payments.length === 0) {

            return res.status(200).json({
                message: "Payment not found"
            });

        }


        const payment =
            payments[0];


        /*
         * Ignore duplicate webhook notifications
         * for an already successful payment.
         */
        if (payment.status === "successful") {

            return res.status(200).json({
                message: "Payment already processed"
            });

        }


        /*
         * Verify that the amount reported by
         * Paystack matches our stored amount.
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
            message: "Webhook processed successfully"
        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }

        console.error(
            "Paystack webhook error:",
            error
        );

        return res.status(500).json({
            message: "Unable to process webhook"
        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};

module.exports = {
    createPayment,
    payPayment,
    getAllPayments,
    paystackWebhook
};
const {
    getOrdersByUserIdModel,
    getOrderByIdModel,
    updateOrderStatusModel,
    cancelOrderModel,
    getAllOrdersModel,
} = require("../models/orderModel");

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await getOrdersByUserIdModel(userId);

        if(orders.length === 0){
            return res.status(404).json({
                message: "No orders found"
            });
        }

        res.status(200).json(orders);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);

        if (isNaN(orderId)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        const userId = req.user.id;

        const orderById = await getOrderByIdModel(orderId, userId);

        if (orderById.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json(orderById[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const cancelOrder = async (req, res) => {

    try {

        const orderId =
            parseInt(req.params.id, 10);

        if (isNaN(orderId)) {

            return res.status(400).json({
                message: "Invalid Order ID"
            });

        }

        const userId = req.user.id;

        const result =
            await cancelOrderModel(
                orderId,
                userId
            );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Order not found or cannot be cancelled"
            });

        }

        return res.status(200).json({
            message:
                "Order cancelled successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message:
                "Internal Server Error"
        });

    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);

        if (isNaN(orderId)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const result = await updateOrderStatusModel(
            orderId,
            status
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersModel();

        if (orders.length === 0) {
            return res.status(404).json({
                message: "No orders found"
            });
        }

        return res.status(200).json(orders);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getAllOrders
};
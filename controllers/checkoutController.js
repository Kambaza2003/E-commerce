const {
    getCartByUserIdModel
} = require("../models/cartModel");

const {
    createOrderFromCartModel,
    clearCartModel,
    getTransactionConnection
} = require("../models/checkoutModel");

const {
    getProductStockModel,
    reduceProductStockModel
} = require("../models/productModel");

const getCheckout = async (req, res) => {
    try {
        // Get the logged-in user's ID from JWT
        const userId = req.user.id;

        // Get all items in this user's cart
        const cart = await getCartByUserIdModel(userId);

        // Make sure the cart isn't empty
        if (cart.length === 0) {
            return res.status(404).json({
                message: "Cart is empty"
            });
        }

        // Calculate the total price
        let total = 0;

        const items = cart.map(item => {
            const subtotal = item.price * item.quantity;

            total += subtotal;

            return {
                cart_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: subtotal
            };
        });

        return res.status(200).json({
            items,
            total
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const completeCheckout = async (req, res) => {
    let connection;

    try {
        const userId = req.user.id;

        const cart = await getCartByUserIdModel(userId);

        if (cart.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        connection = await getTransactionConnection();

        for (const item of cart) {
            const product = await getProductStockModel(item.product_id);

            if (product.length === 0) {
                throw new Error("Product not found");
            }
            if (item.quantity > product[0].stock) {
                const error = new Error(
                    `Not enough stock for ${item.name}`
                );

                error.status = 400;

                throw error;
            }

            await createOrderFromCartModel(
                connection,
                userId,
                item.product_id,
                item.quantity
            );

            const stockResult = await reduceProductStockModel(
                connection,
                item.product_id,
                item.quantity
            );

            if (stockResult.affectedRows === 0) {
                throw new Error(
                    `Stock changed or insufficient stock for product ${item.product_id}`
                );
            }
        }

        await clearCartModel(connection, userId);

        await connection.commit();

        return res.status(201).json({
            message: "Checkout completed successfully"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);

        return res.status(error.status || 500).json({
            message: error.status
                ? error.message
                : "Internal Server Error"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getCheckout,
    completeCheckout
};
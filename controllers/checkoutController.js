const {
    getCartByUserIdModel
} = require("../models/cartModel");

const {
    createOrderFromCartModel,
    clearCartModel
} = require("../models/checkoutModel");

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
    try {
        // Get the logged-in user's ID from the JWT
        const userId = req.user.id;

        // Get the user's cart
        const cart = await getCartByUserIdModel(userId);

        // User cannot checkout with an empty cart
        if (cart.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Create an order for every item in the cart
        for (const item of cart) {
            await createOrderFromCartModel(
                userId,
                item.product_id,
                item.quantity
            );
        }

        await clearCartModel(userId);

        return res.status(201).json({
            message: "Checkout completed successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getCheckout,
    completeCheckout
};
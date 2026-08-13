const {
    getCartItemModel,
    addToCartModel,
    updateCartQuantityModel,
    getCartByUserIdModel,
    deleteCartItemModel
} = require("../models/cartModel");

const addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || quantity === undefined) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        const userId = req.user.id;

        const existingItem = await getCartItemModel(
            userId,
            product_id
        );

        if (existingItem.length > 0) {
            const newQuantity =
                existingItem[0].quantity + quantity;

            await updateCartQuantityModel(
                existingItem[0].id,
                userId,
                newQuantity
            );

            return res.status(200).json({
                message: "Cart updated successfully"
            });
        }

        await addToCartModel(
            userId,
            product_id,
            quantity
        );

        return res.status(201).json({
            message: "Item added to cart successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getMyCart = async (req, res) => {
    try {
        // Get the logged-in user's ID from the JWT.
        const userId = req.user.id;

        // Get all cart items belonging to this user.
        const cart = await getCartByUserIdModel(userId);

        // If the cart is empty, return 404.
        if (cart.length === 0) {
            return res.status(404).json({
                message: "Cart is empty"
            });
        }

        // Return the user's cart.
        return res.status(200).json(cart);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const updateCart = async (req, res) => {
    try {
        // Get the cart item's ID from the URL.
        const cartId = parseInt(req.params.id, 10);

        // Make sure the ID is a valid number.
        if (isNaN(cartId)) {
            return res.status(400).json({
                message: "Invalid Cart ID"
            });
        }

        // Get the new quantity from the request body.
        const { quantity } = req.body;

        // Make sure quantity was provided.
        if (quantity === undefined) {
            return res.status(400).json({
                message: "Quantity is required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        // Update the cart item's quantity.
        const userId = req.user.id;

        const result = await updateCartQuantityModel(
            cartId,
            userId,
            quantity
        );

        // If no row was updated, the cart item doesn't exist.
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        return res.status(200).json({
            message: "Cart quantity updated successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        // Get cart ID from the URL
        const cartId = parseInt(req.params.id, 10);

        // Check if the ID is valid
        if (isNaN(cartId)) {
            return res.status(400).json({
                message: "Invalid Cart ID"
            });
        }

        // Get logged-in user's ID from JWT
        const userId = req.user.id;

        // Delete only if the cart item belongs to this user
        const result = await deleteCartItemModel(
            cartId,
            userId
        );

        // No row was deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        return res.status(200).json({
            message: "Cart item deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    addToCart,
    getMyCart,
    updateCart,
    deleteCartItem
};
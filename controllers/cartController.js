const {
    getCartItemModel,
    addToCartModel,
    updateCartQuantityModel
} = require("../models/cartModel");

// ===============================================
// Add Product To Cart
// ===============================================
const addToCart = async (req, res) => {
    try {

        // Get the logged-in user's ID from the JWT token.
        // This is added by authenticateToken middleware.
        const userId = req.user.id;

        // Get the product ID and quantity from the request body.
        const { product_id, quantity } = req.body;

        // -----------------------------------------------
        // Validation
        // -----------------------------------------------

        // Make sure both product_id and quantity are provided.
        if (!product_id || !quantity) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        // -----------------------------------------------
        // Check if this product is already in the user's cart.
        // -----------------------------------------------

        const existingItem = await getCartItemModel(
            userId,
            product_id
        );

        /*
            existingItem is an ARRAY.

            If the product does NOT exist:

                []

            If the product EXISTS:

                [
                    {
                        id: 7,
                        user_id: 2,
                        product_id: 5,
                        quantity: 2
                    }
                ]
        */

        // -----------------------------------------------
        // If product already exists
        // -----------------------------------------------

        if (existingItem.length > 0) {

            /*
                Current quantity in database = 2

                User sends:

                {
                    "quantity": 3
                }

                New quantity becomes:

                2 + 3 = 5
            */

            const newQuantity =
                existingItem[0].quantity + quantity;

            // Update the quantity in the cart.
            await updateCartQuantityModel(
                existingItem[0].id,
                newQuantity
            );

            return res.status(200).json({
                message: "Cart updated successfully"
            });
        }

        // -----------------------------------------------
        // Product does NOT exist.
        // Add it as a new cart item.
        // -----------------------------------------------

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

module.exports = {
    addToCart
};
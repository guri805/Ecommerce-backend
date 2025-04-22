const CartProductModel = require("../Model/CartProductModel");
const productModel = require("../Model/productModel");
const UserModel = require("../Model/UserModel");

const addToCartController = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate required fields
        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required",
                error: true,
                success: false,
            });
        }

        // Validate quantity
        const validatedQuantity = parseInt(quantity);
        if (isNaN(validatedQuantity) || validatedQuantity <= 0) {
            return res.status(400).json({
                message: "Invalid quantity value",
                error: true,
                success: false,
            });
        }

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        // Check if product already exists in the cart
        const checkItemCart = await CartProductModel.findOne({
            userId,
            productId,
        });

        if (checkItemCart) {
            return res.status(400).json({
                message: "Product already in cart",
                error: true,
                success: false,
            });
        }

        // Add product to cart
        const cartItem = new CartProductModel({
            quantity: validatedQuantity,
            userId,
            productId,
        });

        const save = await cartItem.save();

        // Update user cart array
        const updateCartUser = await UserModel.updateOne(
            { _id: userId },
            {
                $push: {
                    shopping_cart: productId,
                },
            }
        );

        if (updateCartUser.modifiedCount === 0) {
            return res.status(400).json({
                message: "Failed to update user cart",
                error: true,
                success: false,
            });
        }

        // Return success
        return res.status(200).json({
            message: "Product added to cart successfully",
            error: false,
            success: true,
            data: save,
        });

    } catch (error) {
        console.error("Error in addToCartController:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};

const getCartProductController = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                error: true,
                success: false,
            });
        }

        // Check if the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Fetch user's cart items and populate product details
        const cartItems = await CartProductModel.find({ userId }).populate("productId");

        if (cartItems.length === 0) {
            return res.status(200).json({
                message: "Cart is empty",
                error: false,
                success: true,
                data: [],
            });
        }

        return res.status(200).json({
            message: "Cart items retrieved successfully",
            error: false,
            success: true,
            data: cartItems,
        });

    } catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};

const updateCartItemsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required",
                error: true,
                success: false,
            });
        }

        // Validate and parse quantity
        const validatedQuantity = parseInt(quantity);
        if (isNaN(validatedQuantity) || validatedQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be a valid number greater than 0",
                error: true,
                success: false,
            });
        }

        // Find and update the cart item
        const updatedCartItem = await CartProductModel.findOneAndUpdate(
            { userId, productId },
            { quantity: validatedQuantity },
            { new: true }
        ).populate("productId");

        if (!updatedCartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: "Cart item updated successfully",
            error: false,
            success: true,
            data: updatedCartItem,
        });

    } catch (error) {
        console.error("Error updating cart item:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};

const deleteCartItemsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required",
                error: true,
                success: false,
            });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const cartItems = user.shopping_cart || [];
    
        // Filter out the productId
        const updatedUserCart = cartItems.filter(
            (item) => item.toString() !== productId
        );

        user.shopping_cart = updatedUserCart;
        await user.save();

        //  Delete from CartProductModel
        const deletedCartItem = await CartProductModel.findOneAndDelete({ userId, productId });

        if (!deletedCartItem) {
            return res.status(404).json({
                message: "The product in the cart is not found",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: "Item removed successfully",
            error: false,
            success: true,
            data: {
                deletedCartItem,
                updatedUserCart
            },
        });

    } catch (error) {
        console.error("Error updating cart item:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};



module.exports = {
    addToCartController, getCartProductController, updateCartItemsController, deleteCartItemsController
}
const MyListModel = require("../Model/myListModel");
const productModel = require("../Model/productModel");
const UserModel = require("../Model/UserModel");

const addToMyListController = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Validate required fields
        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required",
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
        const checkMyList = await MyListModel.findOne({
            userId,
            productId,
        });

        if (checkMyList) {
            return res.status(400).json({
                message: "Product already in cart",
                error: true,
                success: false,
            });
        }

        // Add product to cart
        const myList = new MyListModel({
            userId,
            productId,
        });

        const save = await myList.save();

        // Update user cart array
        const updateMyListUser = await UserModel.updateOne(
            { _id: userId },
            {
                $push: {
                    my_list: productId,
                },
            }
        );

        if (updateMyListUser.modifiedCount === 0) {
            return res.status(400).json({
                message: "Failed to update user cart",
                error: true,
                success: false,
            });
        }

        // Return success
        return res.status(200).json({
            message: "Product added to mylist successfully",
            error: false,
            success: true,
            data: save,
        });

    } catch (error) {
        console.error("Error in :", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};

const getMyListProductController = async (req, res) => {
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
        const mylist = await MyListModel.find({ userId }).populate("productId");

        if (mylist.length === 0) {
            return res.status(200).json({
                message: "mylist is empty",
                error: false,
                success: true,
                data: [],
            });
        }

        return res.status(200).json({
            message: "Mylist items retrieved successfully",
            error: false,
            success: true,
            data: mylist,
        });

    } catch (error) {
        console.error("Error fetching mylist items:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};

const deleteMyListItemsController = async (req, res) => {
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

        const myList = user.my_list || [];

        // Filter out the productId
        const updatedMyList = myList.filter(
            (item) => item.toString() !== productId
        );

        user.my_list = updatedMyList;
        await user.save();

        //  Delete from CartProductModel
        const deletedMyList = await MyListModel.findOneAndDelete({ userId, productId });

        if (!deletedMyList) {
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
                deletedMyList,
                updatedMyList
            },
        });

    } catch (error) {
        console.error("Error updating mylist item:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
        });
    }
};



module.exports = {
    addToMyListController, getMyListProductController, deleteMyListItemsController
}
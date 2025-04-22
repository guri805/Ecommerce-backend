const CategoryModel = require('../Model/categoryModel');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

// create category with category name and image
var imagesArr = [];
const createCategory = async (req, res) => {
    try {
        imagesArr = [];
        const { categoryName, parentCategoryName, parentCategoryId } = req.body;
        const categoryImages = req.files;

        if (!categoryName) {
            return res.status(400).json({
                message: "Category name should not be empty",
                error: true,
                success: false
            });
        }

        if (!categoryImages || categoryImages.length === 0) {
            return res.status(400).json({
                message: "No image provided",
                error: true,
                success: false
            });
        }

        const existingCategory = await CategoryModel.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < categoryImages?.length; i++) {

            const img = await cloudinary.uploader.upload(
                categoryImages[i].path,
                options,
                function (error, result) {
                    if (error) {
                        console.error("Error uploading image:", error);
                        return res.status(500).json({
                            message: "Error uploading image",
                            error: true,
                            success: false
                        });
                    }
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${categoryImages[i].filename}`);

                }
            );
        }

        const newCategory = new CategoryModel({
            categoryName,
            categoryImages: imagesArr,
            parentCategoryName: parentCategoryName || null,
            parentCategoryId: parentCategoryId || null,
        });

        await newCategory.save();

        imagesArr = [];
        
        return res.status(200).json({
            message: "Category and images uploaded successfully",
            category: newCategory,
            success: true,
            error: false
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// get all the category
const getAllCategories = async (req, res) => {
    try {

        const categories = await CategoryModel.find({});
        const categoryMap = {};

        categories.forEach(cat => {
            categoryMap[cat._id] = { ...cat._doc, children: [] };
        });

        const rootCategories = [];

        categories.forEach(cat => {
            if (cat.parentCategoryId) {
                categoryMap[cat.parentCategoryId].children.push(categoryMap[cat._id]);
            } else {
                rootCategories.push(categoryMap[cat._id]);
            }
        });

        return res.status(200).json({
            categories: rootCategories,
            message: "category fetch successfully",
            error: false,
            success: true
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
}
// get single category by id 
const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false,
                error: true,
            });
        }

        // Fetch the category by ID and populate parent info if needed
        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
                error: true,
            });
        }

        return res.status(200).json({
            message: "Category fetched successfully",
            success: true,
            error: false,
            category,
        });

    } catch (error) {
        console.error("Error fetching category:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
};

// delete image function 
const deleteImageFromCloudinary = async (imgUrl) => {
    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split('.')[0];

    if (imageName) {
        await cloudinary.uploader.destroy(imageName, (error, result) => {
            // console.log("Cloudinary Delete Result:", result);
            if (error) {
                //console.error("Cloudinary Delete Error:", error);
            }
        });
    }
};

// delete category 
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false,
                error: true
            });
        }

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
                error: true
            });
        }

        // Delete main category images
        for (const img of category.categoryImages) {
            await deleteImageFromCloudinary(img);
        }

        // Find subcategories
        const subCategories = await CategoryModel.find({ parentCategoryId: id });

        for (const subCat of subCategories) {
            // Delete subcategory images
            for (const img of subCat.categoryImages) {
                await deleteImageFromCloudinary(img);
            }

            // Find third-level subcategories
            const thirdLevelSubs = await CategoryModel.find({ parentCategoryId: subCat._id });

            for (const thirdSub of thirdLevelSubs) {
                for (const img of thirdSub.categoryImages) {
                    await deleteImageFromCloudinary(img);
                }
                await CategoryModel.findByIdAndDelete(thirdSub._id);
            }

            await CategoryModel.findByIdAndDelete(subCat._id);
        }

        await CategoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Category and all related subcategories deleted successfully",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
};

// update category 
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, parentCategoryName, parentCategoryId } = req.body;
        const categoryImages = req.files;

        if (!id) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false,
                error: true
            });
        }

        if (!categoryName) {
            return res.status(400).json({
                message: "Category name should not be empty",
                error: true,
                success: false
            });
        }

        const existingCategory = await CategoryModel.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        if (categoryImages && categoryImages.length > 0) {
            for (let i = 0; i < existingCategory.categoryImages.length; i++) {
                await deleteImageFromCloudinary(existingCategory.categoryImages[i]);
            }

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            for (let i = 0; i < categoryImages?.length; i++) {
                const img = await cloudinary.uploader.upload(
                    categoryImages[i].path,
                    options,
                    function (error, result) {
                        if (error) {
                            console.error("Error uploading image:", error);
                            return res.status(500).json({
                                message: "Error uploading image",
                                error: true,
                                success: false
                            });
                        }
                        imagesArr.push(result.secure_url);
                        fs.unlinkSync(`uploads/${categoryImages[i].filename}`);
                    }
                );
            }
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            {
                categoryName,
                categoryImages: imagesArr.length > 0 ? imagesArr : existingCategory.categoryImages,
                parentCategoryName: parentCategoryName || null,
                parentCategoryId: parentCategoryId || null,
            },
            { new: true }
        );

        imagesArr = [];

        return res.status(200).json({
            message: "Category updated successfully",
            category: updatedCategory,
            success: true,
            error: false
        }, imagesArr=[]);

    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: true
        });
    }
}

module.exports = {
    createCategory, getAllCategories, getSingleCategory, updateCategory, deleteCategory
}
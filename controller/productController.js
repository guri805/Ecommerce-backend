const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const productModel = require("../Model/productModel");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});


// createProduct api to handle product creation
var imagesArr = [];
const createProduct = async (req, res) => {
    try {
        imagesArr = [];
        const {
            name,
            description,
            brand,
            price,
            oldPrice,
            categoryName,
            categoryId,
            subcategoryName,
            subcategoryId,
            thirdSubcategoryName,
            thirdSubcategoryId,
            countInStock,
            discount,
            rating,
            isFeatured,
            productRam,
            size,
            productWeight
        } = req.body;

        const productImages = req.files;

        if (!name || !description || !thirdSubcategoryId) {
            return res.status(201).json({
                message: "Name, description and thirdSubcategoryId are required",
                error: true,
                success: false
            });
        }

        if (!productImages || productImages.length === 0) {
            return res.status(201).json({
                message: "No product image provided",
                error: true,
                success: false
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < productImages.length; i++) {
            const img = await cloudinary.uploader.upload(
                productImages[i].path,
                options,
                function (error, result) {
                    if (error) {
                        console.error("Error uploading image:", error);
                        return res.status(201).json({
                            message: "Error uploading image",
                            error: true,
                            success: false
                        });
                    }
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${productImages[i].filename}`);
                }
            );
        }

        const newProduct = new productModel({
            name,
            description,
            images: imagesArr,
            brand: brand || '',
            price: price || 0,
            oldPrice: oldPrice || 0,
            categoryName: categoryName || '',
            categoryId: categoryId || null,
            subcategoryName: subcategoryName || '',
            subcategoryId: subcategoryId || null,
            thirdSubcategoryName: thirdSubcategoryName || '',
            thirdSubcategoryId,
            countInStock: countInStock || 0,
            discount: discount || 0,
            isFeatured: isFeatured || false,
            rating: rating || 0,
            productRam: productRam || '',
            size: size || '',
            productWeight: productWeight || ''
        });

        await newProduct.save();

        imagesArr = [];

        return res.status(200).json({
            message: "Product and images uploaded successfully",
            product: newProduct,
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

//get all products
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const totalPosts = await productModel.countDocuments({});
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(400).json({
                message: "Page not found",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * perPage;

        const products = await productModel
            .find({})
            .skip(skip)
            .limit(perPage)
            .populate('thirdSubcategoryId')
            .populate('categoryId')
            .populate('subcategoryId')
            .exec();

        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "All products fetched successfully",
            products,
            totalProducts: totalPosts,
            totalPages,
            currentPage: page,
            error: false,
            success: true,
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

// get all products by category id 
const getAllProductsByCategoryId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "ID is required",
                error: true,
                success: false
            });
        }

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const query = {
            $or: [
                { categoryId: id },
                { subcategoryId: id },
                { thirdSubcategoryId: id }
            ]
        };

        const totalPosts = await productModel.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / perPage);

        const skip = (page - 1) * perPage;

        const products = await productModel
            .find(query)
            .skip(skip)
            .limit(perPage)
            .populate('categoryId')
            .populate('subcategoryId')
            .populate('thirdSubcategoryId')
            .exec();

        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found for this ID",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            products,
            totalProducts: totalPosts,
            totalPages,
            currentPage: page,
            limit: perPage,
            error: false,
            success: true,
        });

    } catch (error) {
        console.error("Error fetching products by ID:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// get all products by category name 
const getAllProductsByCategoryName = async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
                error: true,
                success: false
            });
        }

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const query = {
            $or: [
                { categoryName: name },
                { subcategoryName: name },
                { thirdSubcategoryName: name }
            ]
        };

        const totalPosts = await productModel.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / perPage);
        const skip = (page - 1) * perPage;

        const products = await productModel
            .find(query)
            .skip(skip)
            .limit(perPage)
            .populate('categoryId')
            .populate('subcategoryId')
            .populate('thirdSubcategoryId')
            .exec();

        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found for this category name",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully by category name",
            products,
            totalProducts: totalPosts,
            totalPages,
            currentPage: page,
            limit: perPage,
            error: false,
            success: true,
        });

    } catch (error) {
        console.error("Error fetching products by category name:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// get product by filters 
const getProductsByFilters = async (req, res) => {
    try {
        let {
            minPrice,
            maxPrice,
            minRating,
            brand,
            categoryName,
            subcategoryName,
            thirdSubcategoryName,
            search,
            page,
            perPage
        } = req.query;

        // Parse and validate pagination
        page = parseInt(page) || 1;
        perPage = parseInt(perPage) || 10;
        const skip = (page - 1) * perPage;

        // Parse and validate filter values
        minPrice = parseFloat(minPrice) || 0;
        maxPrice = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;
        minRating = parseFloat(minRating) || 0;

        if (minPrice < 0 || maxPrice < 0 || minRating < 0) {
            return res.status(201).json({
                message: "Price and rating values must be non-negative",
                error: true,
                success: false
            });
        }

        if (minPrice > maxPrice) {
            return res.status(201).json({
                message: "Minimum price cannot be greater than maximum price",
                error: true,
                success: false
            });
        }

        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            rating: { $gte: minRating }
        };

        if (brand) filter.brand = brand;
        if (categoryName) filter.categoryName = categoryName;
        if (subcategoryName) filter.subcategoryName = subcategoryName;
        if (thirdSubcategoryName) filter.thirdSubcategoryName = thirdSubcategoryName;

        if (search && typeof search === "string" && search.trim() !== "") {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await productModel
            .find(filter)
            .skip(skip)
            .limit(perPage)
            .populate('categoryId')
            .populate('subcategoryId')
            .populate('thirdSubcategoryId');

        if (!products.length) {
            return res.status(201).json({
                message: "No products found matching the filters",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Filtered products fetched successfully",
            products,
            totalProducts,
            totalPages,
            currentPage: page,
            perPage,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error fetching filtered products:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
};

// total product count
const getProductCount = async (req, res) => {
    try {
        const count = await productModel.countDocuments();

        return res.status(200).json({
            message: "Total product count fetched successfully",
            totalProducts: count,
            success: true,
            error: false
        });
    } catch (error) {
        console.error("Error fetching product count:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        });
    }
};

// get featured product 
const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await productModel
            .find({ isFeatured: true })
            .populate('categoryId')
            .populate('subcategoryId')
            .populate('thirdSubcategoryId');

        if (featuredProducts.length === 0) {
            return res.status(404).json({
                message: "No featured products found",
                success: false,
                error: true
            });
        }

        return res.status(200).json({
            message: "Featured products fetched successfully",
            products: featuredProducts,
            total: featuredProducts.length,
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error fetching featured products:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
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

// delete product by id 
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }

        // Optional: Delete all product images from Cloudinary
        for (const img of product.images) {
            await deleteImageFromCloudinary(img); // ensure image has Cloudinary public_id format
        }

        await productModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Product deleted successfully",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        });
    }
};

// update product by id 
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productImages = req.files;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true,
            });
        }

        const existingProduct = await productModel.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true,
            });
        }

        // Handle image replacement if new images are uploaded
        if (productImages && productImages.length > 0) {
            // Delete old images from Cloudinary
            for (let i = 0; i < existingProduct.images.length; i++) {
                await cloudinary.uploader.destroy(existingProduct.images[i].split("/").pop().split(".")[0]);
            }

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            for (let i = 0; i < productImages.length; i++) {
                const result = await cloudinary.uploader.upload(productImages[i].path, options);
                imagesArr.push(result.secure_url);
                fs.unlinkSync(productImages[i].path);
            }

            updateData.images = imagesArr;
        }

        // Optional: sanitize numeric fields
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.oldPrice) updateData.oldPrice = parseFloat(updateData.oldPrice);
        if (updateData.countInStock) updateData.countInStock = parseInt(updateData.countInStock);
        if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
        if (updateData.discount) updateData.discount = parseFloat(updateData.discount);

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        imagesArr = [];

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true,
        });
    }
};


module.exports = {
    createProduct, getAllProducts, getAllProductsByCategoryId, getAllProductsByCategoryName, getProductsByFilters, getProductCount, getFeaturedProducts, deleteProduct, updateProduct
}
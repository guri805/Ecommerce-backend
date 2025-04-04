const CategoryModel = require('../Model/categoryModel');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

// image url
var imageArr =[];
const categoryImageUploader = async (req, res) => {
    try {
        imageArr = [];

        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({
                message: "No image provided",
                error: true,
                success: false
            });
        }

        // Cloudinary upload options
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < images.length; i++) {

            const result = await cloudinary.uploader.upload(images[i].path, options);
            imageArr.push(result.secure_url);
            fs.unlinkSync(images[i].path); // Remove local file after upload
        }

        // Update user avatar in DB
        user.avatar = imageArr[0]; // Assuming only one image
        await user.save();

        return res.status(200).json({
            _id: user._id,
            avatar: user.avatar,
            message: "Avatar updated successfully",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
}


module.exports = {
    categoryImageUploader
}
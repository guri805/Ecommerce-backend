const UserModel = require('../Model/UserModel');
const bcryptjs = require('bcryptjs');
const VerificationEmail = require('../utils/verifyEmailTemplate');
const sendEmailFun = require('../config/sendEmail');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});


// REGISTER USER & SEND OTP
const registerUserController = async (req, res) => {
    console.log("Received signup request:", req.body);
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, and password.",
                error: true,
                success: false
            });
        }

        const checkUserExist = await UserModel.findOne({ email });

        if (checkUserExist) {
            return res.status(400).json({
                message: "Email already registered, please log in.",
                error: true,
                success: false
            });
        }

        // Generate OTP & Expiry
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes validity
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Send OTP Email
        await sendEmailFun({
            to: email,
            subject: "Verify Your Email - Ecommerce",
            html: VerificationEmail(name, verifyCode)
        });

        // Return OTP & Expiry for frontend session storage
        return res.status(200).json({
            success: true,
            message: "User registered successfully! Please verify your email.",
            otp: verifyCode, 
            otp_expires: otpExpiry
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// VERIFY OTP
const verifyOtpController = async (req, res) => {
    try {
        const { email, otp, otp_expires } = req.body;

        if (!email || !otp || !otp_expires) {
            return res.status(400).json({
                message: "Email, OTP, and expiry time are required.",
                error: true,
                success: false
            });
        }

        // OTP Expiry Check
        if (Date.now() > otp_expires) {
            return res.status(400).json({
                message: "OTP expired. Please request a new one.",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "OTP verified. Proceed to save user data.",
            success: true
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// SAVE USER AFTER OTP VERIFICATION
const saveUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Invalid user data",
                error: true,
                success: false
            });
        }

        // Hash password before saving
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            verify_email:true
        });

        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully!",
            success: true
        });

    } catch (error) {
        console.error("Save user error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// login 
const loginUserController = async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "User not found",
            error: true,
            success: false
        })
    }

    const checkPassword = await bcryptjs.compare(password, user.password)
    // const checkPassword = user.password === password
    if (!checkPassword) {
        return res.status(400).json({
            message: "Invalid password",
            error: true,
            success: false
        })
    }
    return res.status(200).json({
        success: true,
        message: "login successful",
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
        }
    })
}

// image url
const userAvatarController = async (req, res) => {
    try {
        let imageArr = [];

        // Get userId from the authenticated request
        const userId = req.userId || "67cff32f4ddcf1b7821a1161"; // Replace with actual logic
        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({
                message: "No image provided",
                error: true,
                success: false
            });
        }


        // Fetch user from DB
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const userAvatar = user.avatar;

        // first remove image from cloudinary 
        const imgUrl = userAvatar
        const urlArr = imgUrl.split("/");
        const avatar_image = urlArr[urlArr.length - 1];
        const imageName = avatar_image.split(".")[0];

        if (imageName) {
            const response = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    console.log(error, result);
                }
            )
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

// remove image from cloudinary
const removeIamgeFromCloudinary = async (req, res) => {
    const imgUrl = req.query.img
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
        const response = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                console.log(error, result);
            }
        )
        if (response) {
            res.status(200).send(response)
        }
    }

}

// update user
const updateUserDetails = async (req, res) => {
    try {
        const { name, mobile, email, address, password } = req.body;
        const userDetails = await UserModel.findOneAndUpdate({ email }, { name, password, mobile, address, password }, { new: true });
        if (!userDetails) {
            return res.status(200).json({
                success: false,
                message: "user not found ",
                error: true,
            });
        }
        res.status(200).json({
            success: true,
            message: "user updated successfully",
            error: true,
            userDetails
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
}
module.exports = { registerUserController, verifyOtpController, loginUserController, saveUserController, userAvatarController, removeIamgeFromCloudinary, updateUserDetails };

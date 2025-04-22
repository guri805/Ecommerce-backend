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


// REGISTER USER & SAVE TO DATABASE
const registerNewUserController = async (req, res) => {
    // console.log("Received signup request:", req.body);
    try {
        const { name, mobile, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !mobile || !email || !password) {
            return res.status(201).json({
                success: false,
                error: true,
                message: "Please provide name, email, mobile, and password."
            });
        }

        // Check if user already exists
        const checkUserExist = await UserModel.findOne({ email });
        if (checkUserExist) {
            return res.status(201).json({
                success: false,
                error: true,
                message: "Email already registered, please log in."
            });
        }

        // Hash the password before saving
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Save the user to database
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            mobile
        });

        await newUser.save();

        // Respond with success message
        return res.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully.",
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            error: true,
            message: "Internal server error"
        });
    }
};

// VERIFY OTP
// OTP Verification Controller
const emailVerifyOtpController = async (req, res) => {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(201).json({
                message: "OTP and email are required.",
                error: true,
                success: false
            });
        }

        // Fetch user from the database
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(201).json({
                message: "User not found.",
                error: true,
                success: false
            });
        }

        // OTP Expiry Check
        if (Date.now() > new Date(user.otp_expires)) {
            return res.status(201).json({
                message: "OTP expired. Please request a new one.",
                error: true,
                success: true
            });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(201).json({
                message: "Invalid OTP. Please try again.",
                error: true,
                success: false
            });
        }

        // OTP is valid, mark user as verified
        user.verify_email = true;
        user.otp = null; // Clear OTP after successful verification
        user.otp_expires = null;
        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully.",
            error: false,
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
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

// User Login Controller
const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(201).json({
                message: "Email and password are required.",
                error: true,
                success: false
            });
        }

        // Find user in database
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(201).json({
                message: "Email not registred. Please register first.",
                error: true,
                success: false
            });
        }

        // Check password validity
        const checkPassword = await bcryptjs.compare(password, user.password);
        if (!checkPassword) {
            return res.status(201).json({
                message: "Invalid password",
                error: true,
                success: false
            });
        }

        // If email is not verified, send OTP
        if (!user.verify_email) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

            user.otp = otp;
            user.otp_expires = otpExpires;
            await user.save();

            // Send OTP via email
            await sendEmailFun({
                to: email,
                subject: "Verify Your Email - Ecommerce",
                html: VerificationEmail(user.name, otp)
            });

            return res.status(201).json({
                message: "Email not verified. OTP sent.",
                error: true,
                success: false,
                user: {
                    email,
                    otpExpiry: otpExpires,
                    verify_email: user.verify_email,
                },
            });
        }

        // If email is verified, login successfully
        return res.status(200).json({
            success: true,
            error: false,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                verify_email: user.verify_email,
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
};

// reset password api's
// otp send to email
const forgotPasswordSendOtpController = async (req, res) => {
    try {
        // console.log("Received forgot password request:", req.body);
        const { email } = req.body;

        if (!email) {
            return res.status(201).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        // Find the user
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(201).json({
                message: "Enter Registered Email",
                error: true,
                success: false
            });
        }

        // Generate OTP and expiration time
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        // Update user with OTP details
        user.otp = otp;
        user.otp_expires = otpExpires;
        await user.save();

        // Send OTP via email
        await sendEmailFun({
            to: email,
            subject: "Verify Your Email - Ecommerce",
            html: VerificationEmail(user.name, otp)
        });

        res.json({
            message: "OTP sent successfully",
            otpExpiry: otpExpires,
            email,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
            details: error.message
        });
    }
};

// Verify OTP and set new password
const verifyOtpAndSetPasswordController = async (req, res) => {
    try {
        // console.log("Received reset password request:", req.body);
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(201).json({
                message: "Email, OTP, and new password are required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(201).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Verify OTP and check expiration
        if (user.otp !== otp || user.otp_expires < new Date()) {
            return res.status(201).json({
                message: "Invalid or expired OTP",
                error: true,
                success: false
            });
        }

        // Hash the new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Clear OTP and update password
        user.password = hashedPassword;
        user.otp = null;
        user.otp_expires = null;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
            details: error.message
        });
    }
};

// Get user details
const getUserDetailsController = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            error: false,
            success: true,
            user
        });

    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
            details: error.message
        });
    }
}

// 67d3f46b172096678731752a
// image url
var imagesArr = [];
const userAvatarController = async (req, res) => {
    try {
        imagesArr = [];

        // Get userId from the authenticated request
        const userId = req.userId || "67d3f46b172096678731752a"; // Replace with actual logic
        const image = req.files;

        if (!image || image.length === 0) {
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

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
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
                    fs.unlinkSync(`uploads/${image[i].filename}`); // Remove local file after upload

                }
            );
        }

        // Update user avatar in DB
        user.avatar = imagesArr[0]; // Assuming only one image
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
const updateUserDetailsController = async (req, res) => {
    try {
        const { id } = req.params;
        const UserDataToUpdate = req.body;

        if (!id || !UserDataToUpdate) {
            return res.status(400).json({
                message: "Missing required parameters",
                error: true,
                success: false
            });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, UserDataToUpdate, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        res.json({
            message: "User updated successfully",
            error: false,
            success: true,
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false,
            details: error.message
        });
    }
};

module.exports = { registerNewUserController, emailVerifyOtpController, loginUserController, userAvatarController, removeIamgeFromCloudinary, updateUserDetailsController, forgotPasswordSendOtpController, verifyOtpAndSetPasswordController, getUserDetailsController };







const UserModel = require('../Model/UserModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VerificationEmail = require('../utils/verifyEmailTemplate');
const sendEmailFun = require('../config/sendEmail');

const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide email, name, and password.",
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

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const user = new UserModel({
            email,
            password: hashPassword,
            name,
            otp: verifyCode,
            otp_expires: new Date(Date.now() + 600000) // 10 minutes from now
        });

        await user.save();

        // Send verification email
        await sendEmailFun({
            to: email,
            subject: "Verify Your Email - Ecommerce",
            text: "",
            html: VerificationEmail(name, verifyCode)
        });

        if (!process.env.JSON_WEB_TOKEN_SECRET_KEY) {
            throw new Error("Missing JWT secret key in environment variables.");
        }

        const token = jwt.sign(
            { id: user._id }, // Only store user ID
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: "7d" } // Token expires in 7 days
        );

        return res.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! Please verify your email.",
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

const verifyEmailController = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        const isValidOtp = user.otp === otp;
        const isNotExpired = user.otp_expires > Date.now()

        if (isValidOtp && isNotExpired) {
            user.verify_email = true,
                user.otp = null,
                user.otp_expires = null
            await user.save();
            return res.status(200).json({
                message: "Emial verified successfully",
                error: false,
                success: true
            });
        } else if (!isValidOtp) {
            return res.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        } else {
            return res.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

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

module.exports = { registerUserController, verifyEmailController, loginUserController };

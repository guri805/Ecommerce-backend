const UserModel = require('../Model/UserModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VerificationEmail = require('../utils/verifyEmailTemplate');
const sendEmailFun = require('../config/sendEmail');

const registerUserController = async (req, res) => {
    console.log("Received signup request:", req.body); 
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

        // Send verification email
        await sendEmailFun({
            to: email,
            subject: "Verify Your Email - Ecommerce",
            html: VerificationEmail(name, verifyCode)
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully! Please verify your email.",
            otp: verifyCode
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required.",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const isValidOtp = user.otp === otp;
        const isNotExpired = user.otp_expires > Date.now();

        if (isValidOtp && isNotExpired) {
            return res.status(200).json({
                message: "OTP verified. Proceed to save user data.",
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
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

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

        const newUser = new UserModel({
            name,
            email,
            password
        });
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully!",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};


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

module.exports = { registerUserController, verifyOtpController, loginUserController, saveUserController };

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide Name"]
    },
    email: {
        type: String,
        required: [true, "Provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Provide Password"]
    },
    avatar: {
        type: String,
        default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    address_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address'
    },
    shopping_cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cartProduct'
    },
    order_history: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    },
    otp: {
        type: String,
        default: null
    },
    otp_expires: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model("Users", userSchema);
module.exports = UserModel;

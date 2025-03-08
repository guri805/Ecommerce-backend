const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: String,
        required: [true, "Provide Order ID"],
        unique: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
    product_details: {
        name: String,
        image: Array
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    deliver_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    subtotal_amount: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    },

})

const orderModel = mongoose.model('order', orderSchema)

module.exports = orderModel;
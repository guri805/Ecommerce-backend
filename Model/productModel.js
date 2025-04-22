const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        }
    ],
    brand: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    oldPrice: {
        type: Number,
        default: 0,
    },
    categoryName: {
        type: String,
        default: '',
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    subcategoryName: {
        type: String,
        default: '',
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    thirdSubcategoryName: {
        type: String,
        default: '',
    },
    thirdSubcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    countInStock: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    productRam: {
        type: String,
        default: "",
    },
    size: {
        type: String,
        default: "",
    },
    productWeight: {
        type: String,
        default: "",
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
},{
    timestamps: true,
});

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
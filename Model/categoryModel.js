const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
    categoryImages: {
        type: [String],
        required: true,
    },
    parentCategoryName: {
        type: String,
        default: null,
    },
    parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
}, { timestamps: true });

const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
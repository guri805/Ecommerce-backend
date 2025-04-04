const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    parentCateogryName: {
        type: String,
        default: null,
        required: true,
    },
    parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        default: null,
    },
}, { timestamps: true });

const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
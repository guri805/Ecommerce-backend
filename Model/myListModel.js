const mongoose = require('mongoose')

const MyListSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },

}, {
    timestamps: true
})

const MyListModel = mongoose.model("MyList", MyListSchema)

module.exports = MyListModel
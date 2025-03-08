require('dotenv').config();
const mongoose = require('mongoose')
const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)
    .then(async () => {
        console.log('mongodb is connected');
    })
    .catch((err) => {
        console.log('failed to connect mongodb', err);

    })
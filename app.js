const express = require('express')
const cors = require('cors')
const app = express()
require('./config/Db')
require('dotenv').config();
const cookieParser = require("cookie-parser");
const AuthRouter = require('./Router/AuthRouter');
const categoryRouter = require('./Router/categoryRouter');
const productRouter = require('./Router/productRouter');
const cartRouter = require('./Router/cartProductRouter');
const myListRouter = require('./Router/myListRouter');

const port = 3001 || process.env.PORT

// main app
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/', AuthRouter);
app.use('/api/category',categoryRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter)
app.use('/api/mylist',myListRouter)

app.listen(port, () => {
    console.log(`server listen on port: ${port}`);

})
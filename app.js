const express = require('express')
const cors = require('cors')
const app = express()
require('./config/Db')
require('dotenv').config();
const AuthRouter = require('./Router/AuthRouter')

const port = 3001 || process.env.PORT

// main app
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());
app.use('/', AuthRouter)


app.listen(port, () => {
    console.log(`server listen on port: ${port}`);

})
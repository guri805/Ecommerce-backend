const express = require('express');
const { registerUserController, verifyEmailController, loginUserController } = require('../controller/UserController');
const router = express.Router()

// user routes
router.post('/signup', registerUserController)
router.post('/verifyemail', verifyEmailController)
router.post('/login',loginUserController)

module.exports = router;
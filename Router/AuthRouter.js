const express = require('express');
const { registerUserController, verifyOtpController, loginUserController, saveUserController } = require('../controller/UserController');
const router = express.Router()

// user routes
router.post('/signup', registerUserController)
router.post('/verifyotp', verifyOtpController)
router.post('/login', loginUserController)
router.post('/saveuser', saveUserController)

module.exports = router;
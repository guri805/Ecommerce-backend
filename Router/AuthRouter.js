const express = require('express');
const { registerUserController, verifyOtpController, loginUserController, saveUserController, userAvatarController, removeIamgeFromCloudinary, updateUserDetails } = require('../controller/UserController');
const upload = require('../Middlewares/multer');
const router = express.Router()

// user routes
router.post('/signup', registerUserController)
router.post('/verifyotp', verifyOtpController)
router.post('/login', loginUserController)
router.post('/saveuser', saveUserController)
router.put('/user-avatar', upload.array('avatar'), userAvatarController)
router.delete('/deleteImage', removeIamgeFromCloudinary)
router.post('/updateuser', updateUserDetails)

module.exports = router;
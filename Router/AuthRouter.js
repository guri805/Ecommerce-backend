const express = require('express');
const { registerUserController, verifyOtpController, loginUserController, userAvatarController, removeIamgeFromCloudinary, updateUserDetailsController, forgotPasswordSendOtpController, resetPasswordController, setNewPasswordController } = require('../controller/UserController');
const upload = require('../Middlewares/multer');
const validateMiddleware = require('../Middlewares/ValidateMiddleware');
const SignupFormSchema = require('../validation/UserValidation');
const router = express.Router()

// user routes
router.post('/signup', validateMiddleware(SignupFormSchema), registerUserController)
router.post('/verifyotp', verifyOtpController)
router.post('/login', loginUserController)
router.put('/user-avatar', upload.array('avatar'), userAvatarController)
router.delete('/deleteImage', removeIamgeFromCloudinary)
router.put('/updateuser/:id', updateUserDetailsController)
router.post('/forgotpasswordotp', forgotPasswordSendOtpController)
router.post('/resetpassword', resetPasswordController)
router.put('/updatepassword', setNewPasswordController)

module.exports = router;
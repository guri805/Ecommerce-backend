const express = require('express');
const { registerNewUserController, emailVerifyOtpController, loginUserController, userAvatarController, removeIamgeFromCloudinary, updateUserDetailsController, forgotPasswordSendOtpController, verifyOtpAndSetPasswordController, getUserDetailsController } = require('../controller/UserController');
const upload = require('../Middlewares/multer');
const validateMiddleware = require('../Middlewares/ValidateMiddleware');
const SignupFormSchema = require('../validation/UserValidation');
const router = express.Router()

// user routes
router.post('/signup', validateMiddleware(SignupFormSchema), registerNewUserController)
router.post('/verifyotp', emailVerifyOtpController)
router.post('/login', loginUserController)
router.post('/forgotpasswordotp', forgotPasswordSendOtpController)
router.post('/verifyotpandsetpassword', verifyOtpAndSetPasswordController)

router.put('/user-avatar' ,upload.array('avatar'), userAvatarController)
router.delete('/deleteImage', removeIamgeFromCloudinary)
router.put('/updateuser/:id', updateUserDetailsController)
router.get('/getuserdetails', getUserDetailsController)

module.exports = router;
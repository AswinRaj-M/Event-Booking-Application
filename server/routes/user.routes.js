import express from "express"
import { 
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  resendOtp,
  forgotPassword,
  resetPassword
} from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/role.middleware.js"
import { asyncHandler } from '../middleware/error.middleware.js'  
import { validate } from "../middleware/validate.middleware.js"
import { 
  registerValidation, 
  loginValidation, 
  verifyOTPValidation 
} from "../validations/user.validation.js"

const router = express.Router()

router.post('/register', registerValidation, validate, asyncHandler(registerUser))
router.post('/verify-otp', verifyOTPValidation, validate, asyncHandler(verifyOTP))
router.post('/login', loginValidation, validate, asyncHandler(loginUser))
router.post('/resend-otp',validate,asyncHandler(resendOtp))
router.post('/forgot-password',validate,asyncHandler(forgotPassword))
router.patch('/reset-password',validate,asyncHandler(resetPassword))
router.get('/refresh-token', asyncHandler(refreshAccessToken))
router.post('/logout', protect, requireRole("user"), asyncHandler(logoutUser))
router.get('/me', protect, asyncHandler(getMe))

export default router
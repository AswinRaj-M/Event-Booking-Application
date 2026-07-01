import express from "express"
import { 
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleCallback,
  getUserProfile,
  updateUserProfile,
  updateUserProfilePicture,
  getExploreEvents,
  sendEmailUpdateOtp,
  verifyEmailUpdateOtp,
  resendEmailUpdateOtp
} from "../controllers/user.controller.js"
import passport from "passport"
import upload from "../middleware/upload.js"
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback
);
router.post('/resend-otp',validate,asyncHandler(resendOtp))
router.post("/forgot-password",validate,asyncHandler(forgotPassword))
router.patch("/reset-password/",validate,asyncHandler(resetPassword))
router.get('/refresh-token', asyncHandler(refreshAccessToken))
router.post('/logout', protect, requireRole("user"), asyncHandler(logoutUser))

router.get('/explore-events', protect, requireRole("user"), asyncHandler(getExploreEvents))

router.get('/profile', protect, requireRole("user"), asyncHandler(getUserProfile))
router.put('/update-profile', protect, requireRole("user"), asyncHandler(updateUserProfile))
router.post('/send-email-update-otp', protect, requireRole("user"), asyncHandler(sendEmailUpdateOtp))
router.post('/verify-email-update-otp', protect, requireRole("user"), asyncHandler(verifyEmailUpdateOtp))
router.post('/resend-email-update-otp', protect, requireRole("user"), asyncHandler(resendEmailUpdateOtp))
router.patch('/profile/picture', protect, requireRole("user"), upload.single('profilePicture'), asyncHandler(updateUserProfilePicture))

export default router
import express from "express"
import { 
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser
} from "../controllers/user.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/role.middleware.js"
import { asyncHandler } from '../middleware/error.middleware.js'  

const router = express.Router()

router.post('/register', asyncHandler(registerUser), protect, requireRole("user"))
router.post('/verify-otp', asyncHandler(verifyOTP), protect, requireRole("user"))
router.post('/login', asyncHandler(loginUser), protect, requireRole("user"))
router.get('/refresh-token', asyncHandler(refreshAccessToken), protect, requireRole("user"))
router.post('/logout', asyncHandler(logoutUser), protect, requireRole("user"))

export default router
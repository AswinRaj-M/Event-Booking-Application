import express from "express"
import { 
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser
} from "../controllers/user.controller.js"

const router = express.Router()

router.post('/register',registerUser)
router.post('/verify-otp',verifyOTP)  
router.post('/login',loginUser)
router.get('/refresh-token',refreshAccessToken)
router.post('/logout',logoutUser)



export default router
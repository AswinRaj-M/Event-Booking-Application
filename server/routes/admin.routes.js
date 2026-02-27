import express from 'express'
import {
  AdminLogin,
  logoutAdmin

} from "../controllers/admin.controller.js" 

const router = express.Router()

router.post('/login',AdminLogin)
router.post('/logout',logoutAdmin)
export default router
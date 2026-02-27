import express from 'express'
import {
  AdminLogin

} from "../controllers/admin.controller.js" 

const router = express.Router()

router.post('/login',AdminLogin)

export default router
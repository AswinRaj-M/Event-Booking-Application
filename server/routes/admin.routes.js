import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById

} from "../controllers/admin.controller.js" 

const router = express.Router()



router.post('/login',AdminLogin)
router.post('/logout',logoutAdmin)
router.get("/vendorManagement",getAllVendors)
router.get('/vendor/:id',getVendorById)






export default router
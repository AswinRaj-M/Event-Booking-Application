import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById,
  vendorApprove

} from "../controllers/admin.controller.js" 

const router = express.Router()



router.post('/login',AdminLogin)
router.post('/logout',logoutAdmin)
router.get("/vendorManagement",getAllVendors)
router.get('/vendor-application/:id',getVendorById)
router.patch('/vendor/approve-application',vendorApprove)





export default router
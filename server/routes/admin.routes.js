import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById,
  vendorApprove
} from "../controllers/admin.controller.js" 
import { protect } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin), protect, requireRole("admin"))
router.post('/logout', asyncHandler(logoutAdmin), protect, requireRole("admin"))
router.get("/vendorManagement", asyncHandler(getAllVendors), protect, requireRole("admin"))
router.get('/vendor-application/:id', asyncHandler(getVendorById), protect, requireRole("admin"))
router.patch('/vendor/approve-application', asyncHandler(vendorApprove), protect, requireRole("admin"))

export default router
import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById,
  vendorApprove,
  vendorReject,
  getAdminMe
} from "../controllers/admin.controller.js"
import { protect } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin))
router.post('/logout', protect, requireRole("admin"), asyncHandler(logoutAdmin))
router.get("/vendorManagement", protect, requireRole("admin"), asyncHandler(getAllVendors))
router.get('/vendor-application/:id', protect, requireRole("admin"), asyncHandler(getVendorById))
router.patch('/vendors/approve-application', protect, requireRole("admin"), asyncHandler(vendorApprove))
router.patch('/vendors/reject-application', protect, requireRole("admin"), asyncHandler(vendorReject))
router.get('/me', protect, requireRole("admin"), asyncHandler(getAdminMe))

export default router
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
import { protect, optionalProtect } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin))
router.post('/logout', protect(['admin']), requireRole("admin"), asyncHandler(logoutAdmin))
router.get("/vendorManagement", protect(['admin']), requireRole("admin"), asyncHandler(getAllVendors))
router.get('/vendor-application/:id', protect(['admin']), requireRole("admin"), asyncHandler(getVendorById))
router.patch('/vendors/approve-application', protect(['admin']), requireRole("admin"), asyncHandler(vendorApprove))
router.patch('/vendors/reject-application', protect(['admin']), requireRole("admin"), asyncHandler(vendorReject))
router.get('/me', optionalProtect(['admin']), asyncHandler(getAdminMe))

export default router
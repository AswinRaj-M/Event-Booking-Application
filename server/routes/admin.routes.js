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
import { protectAdmin } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin))
router.post('/logout', protectAdmin, requireRole("admin"), asyncHandler(logoutAdmin))
router.get("/vendorManagement", protectAdmin, requireRole("admin"), asyncHandler(getAllVendors))
router.get('/vendor-application/:id', protectAdmin, requireRole("admin"), asyncHandler(getVendorById))
router.patch('/vendors/approve-application', protectAdmin, requireRole("admin"), asyncHandler(vendorApprove))
router.patch('/vendors/reject-application', protectAdmin, requireRole("admin"), asyncHandler(vendorReject))
router.get('/me', protectAdmin, requireRole("admin"), asyncHandler(getAdminMe))

export default router
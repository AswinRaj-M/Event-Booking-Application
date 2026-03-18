import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById,
  vendorApprove,
  vendorReject
} from "../controllers/admin.controller.js"
import { protect } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin))
router.post('/logout', asyncHandler(logoutAdmin), protect, requireRole("admin"))
router.get("/vendorManagement", asyncHandler(getAllVendors), protect, requireRole("admin"))
router.get('/vendor-application/:id', asyncHandler(getVendorById), protect, requireRole("admin"))
router.patch('/vendors/approve-application', asyncHandler(vendorApprove), protect, requireRole("admin"))
router.patch('/vendors/reject-application',protect,requireRole("admin"),asyncHandler(vendorReject))


export default router
import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
  getAllVendors,
  getVendorById,
  vendorApprove,
  vendorReject,
  VendorSendEmail,
  createCategories,
  getAllCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  vendorSuspend,
  vendorUnsuspend
} from "../controllers/admin.controller.js"
import { protect } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { asyncHandler } from '../middleware/error.middleware.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/login', asyncHandler(AdminLogin))
router.post('/logout', protect, requireRole("admin"), asyncHandler(logoutAdmin))
router.get("/vendorManagement", protect, requireRole("admin"), asyncHandler(getAllVendors))
router.get('/vendor-application/:id', protect, requireRole("admin"), asyncHandler(getVendorById))
router.patch('/vendors/approve-application', protect, requireRole("admin"), asyncHandler(vendorApprove))
router.patch('/vendors/reject-application', protect, requireRole("admin"), asyncHandler(vendorReject))
router.patch('/vendors/suspend-vendor', protect, requireRole("admin"), asyncHandler(vendorSuspend))
router.patch('/vendors/unsuspend-vendor', protect, requireRole("admin"), asyncHandler(vendorUnsuspend))
router.post("/vendors/send-email", protect, requireRole("admin"), asyncHandler(VendorSendEmail))
router.post(

  '/create-category',
  upload.fields([
    { name: "categoryIcon", maxCount: 1 }
  ]), protect, requireRole("admin"), asyncHandler(createCategories))

router.put(
  '/update-category/:id',
  upload.fields([
    { name: "categoryIcon", maxCount: 1 }
  ]), protect, requireRole("admin"), asyncHandler(updateCategory))
router.put('/status-update/:id', protect, requireRole("admin"), asyncHandler(toggleCategoryStatus))
router.delete('/delete-category/:id', protect, requireRole("admin"), asyncHandler(deleteCategory))


export default router
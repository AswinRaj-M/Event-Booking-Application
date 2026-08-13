import express from 'express'
import {
  AdminLogin,
  logoutAdmin,
} from "../controllers/admin/auth.controller.js"
import {
  getAllVendors,
  getVendorById,
  vendorApprove,
  vendorReject,
  vendorSuspend,
  vendorUnsuspend,
  VendorSendEmail,
} from "../controllers/admin/vendor.controller.js"
import {
  createCategories,
  getAllCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../controllers/admin/category.controller.js"
import {
  getAllUsers,
  toggleUserBlock,
} from "../controllers/admin/user.controller.js"
import {
  getAllEventsAdmin,
  toggleBlockEvent,
} from "../controllers/admin/event.controller.js"
import {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  toggleCouponStatus,
  deleteCoupon
} from "../controllers/admin/couponManage.controller.js"
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
router.get('/users-management',protect,requireRole("admin"),asyncHandler(getAllUsers))
router.patch('/users/toggle-block/:id', protect, requireRole("admin"), asyncHandler(toggleUserBlock))
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
router.get("/events-management", protect, requireRole("admin"), asyncHandler(getAllEventsAdmin))
router.patch("/events/toggle-block/:eventId", protect, requireRole("admin"), asyncHandler(toggleBlockEvent))

// Coupon Routes
router.post('/coupons', protect, requireRole("admin"), asyncHandler(createCoupon))
router.put('/coupons/:id', protect, requireRole("admin"), asyncHandler(updateCoupon))
router.get('/coupons', protect, requireRole("admin"), asyncHandler(getAllCoupons))
router.patch('/coupons/toggle-status/:id', protect, requireRole("admin"), asyncHandler(toggleCouponStatus))
router.delete('/coupons/:id', protect, requireRole("admin"), asyncHandler(deleteCoupon))

// Withdrawal Routes
import {
  getAdminWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
} from "../controllers/admin/withdrawal.controller.js"

router.get('/withdrawals', protect, requireRole("admin"), asyncHandler(getAdminWithdrawalRequests))
router.patch('/withdrawals/:id/approve', protect, requireRole("admin"), asyncHandler(approveWithdrawal))
router.patch('/withdrawals/:id/reject', protect, requireRole("admin"), asyncHandler(rejectWithdrawal))

export default router
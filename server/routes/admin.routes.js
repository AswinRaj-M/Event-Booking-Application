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
import {
  createAdminWalletOrder,
  verifyAdminWalletPayment,
  recordAdminWalletPaymentFailure,
  getAdminWalletDetails,
} from "../controllers/admin/adminWallet.controller.js"

router.get('/withdrawals', protect, requireRole("admin"), asyncHandler(getAdminWithdrawalRequests))
router.patch('/withdrawals/:id/approve', protect, requireRole("admin"), asyncHandler(approveWithdrawal))
router.patch('/withdrawals/:id/reject', protect, requireRole("admin"), asyncHandler(rejectWithdrawal))

// Admin Wallet Routes
router.post('/wallet/create-order', protect, requireRole("admin"), asyncHandler(createAdminWalletOrder))
router.post('/wallet/verify-payment', protect, requireRole("admin"), asyncHandler(verifyAdminWalletPayment))
router.post('/wallet/record-failure', protect, requireRole("admin"), asyncHandler(recordAdminWalletPaymentFailure))
router.get('/wallet/details', protect, requireRole("admin"), asyncHandler(getAdminWalletDetails))

// Admin Analytics
import { getAdminAnalytics } from "../controllers/admin/analytics.controller.js"
router.get('/analytics', protect, requireRole("admin"), asyncHandler(getAdminAnalytics))

// Admin Booking Management
import { getAllBookingsAdmin } from "../controllers/admin/booking.controller.js"
router.get('/bookings', protect, requireRole("admin"), asyncHandler(getAllBookingsAdmin))

// Admin Notification Routes
import {
  getMyNotifications,
  markMyNotificationsRead,
  deleteMyNotification,
  clearAllMyNotifications
} from "../controllers/common/notification.controller.js"

router.get('/notifications', protect, requireRole("admin"), asyncHandler(getMyNotifications))
router.patch('/notifications/mark-read', protect, requireRole("admin"), asyncHandler(markMyNotificationsRead))
router.delete('/notifications/clear-all', protect, requireRole("admin"), asyncHandler(clearAllMyNotifications))
router.delete('/notifications/:id', protect, requireRole("admin"), asyncHandler(deleteMyNotification))

// Admin Platform Setting Routes
import {
  getPlatformSetting,
  updatePlatformSetting,
} from "../controllers/admin/platformSetting.controller.js"

router.get('/platform-fee', protect, requireRole("admin"), asyncHandler(getPlatformSetting))
router.put('/platform-fee', protect, requireRole("admin"), asyncHandler(updatePlatformSetting))

export default router
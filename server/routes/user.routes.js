import express from "express"
import { 
  registerUser,
  verifyOTP,
  loginUser,
  refreshAccessToken,
  logoutUser,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleCallback,
} from "../controllers/user/auth.controller.js"
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateUserProfilePicture,
  sendEmailUpdateOtp,
  verifyEmailUpdateOtp,
  resendEmailUpdateOtp,
} from "../controllers/user/profile.controller.js"
import {
  getExploreEvents,
  getEventById,
  getOrganizers,
} from "../controllers/user/event.controller.js"
import {
  createBooking,
  getBookingHistory,
  getBookingDetails,
  getUserTickets,
  cancelTicket,
  cancelBooking,
} from "../controllers/user/booking.controller.js"
import { validateCoupon, getPublicCoupons } from "../controllers/user/coupon.controller.js"
import {
  createUserWalletOrder,
  verifyUserWalletPayment,
  recordUserWalletFailure,
  getUserWalletDetails,
  requestUserWithdrawal,
} from "../controllers/user/userWallet.controller.js"
import {
  createOrganizerReview,
  getMyReviews,
  getEventReviewStatus,
  getOrganizerReviews,
} from "../controllers/user/review.controller.js"
import {
  getMyNotifications,
  markMyNotificationsRead,
  deleteMyNotification,
  clearAllMyNotifications,
} from "../controllers/common/notification.controller.js"
import passport from "passport"
import upload from "../middleware/upload.js"
import { protect } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/role.middleware.js"
import { asyncHandler } from '../middleware/error.middleware.js'  
import { validate } from "../middleware/validate.middleware.js"
import { 
  registerValidation, 
  loginValidation, 
  verifyOTPValidation,
  changePasswordValidation,
  userProfileUpdateValidation,
  createReviewValidation,
} from "../validations/user.validation.js"

const router = express.Router()

router.post('/register', registerValidation, validate, asyncHandler(registerUser))
router.post('/verify-otp', verifyOTPValidation, validate, asyncHandler(verifyOTP))
router.post('/login', loginValidation, validate, asyncHandler(loginUser))
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback
);
router.post('/resend-otp',validate,asyncHandler(resendOtp))
router.post("/forgot-password",validate,asyncHandler(forgotPassword))
router.patch("/reset-password/",validate,asyncHandler(resetPassword))
router.get('/refresh-token', asyncHandler(refreshAccessToken))
router.post('/logout', protect, requireRole("user"), asyncHandler(logoutUser))

router.get('/explore-events', protect, requireRole("user"), asyncHandler(getExploreEvents))
router.get('/events/:id', protect, requireRole("user"), asyncHandler(getEventById))
router.get('/organizers', protect, requireRole("user"), asyncHandler(getOrganizers))

router.get('/profile', protect, requireRole("user"), asyncHandler(getUserProfile))
router.put('/update-profile', protect, requireRole("user"), userProfileUpdateValidation, validate, asyncHandler(updateUserProfile))
router.put('/change-password', protect, requireRole("user"), changePasswordValidation, validate, asyncHandler(changePassword))
router.post('/send-email-update-otp', protect, requireRole("user"), asyncHandler(sendEmailUpdateOtp))
router.post('/verify-email-update-otp', protect, requireRole("user"), userProfileUpdateValidation, validate, asyncHandler(verifyEmailUpdateOtp))
router.post('/resend-email-update-otp', protect, requireRole("user"), asyncHandler(resendEmailUpdateOtp))
router.patch('/profile/picture', protect, requireRole("user"), upload.single('profilePicture'), asyncHandler(updateUserProfilePicture))


router.post('/booking/create',protect,asyncHandler(createBooking))
router.get('/booking/history',protect,asyncHandler(getBookingHistory))
router.get('/booking/details/:bookingId',protect,asyncHandler(getBookingDetails))
router.post('/booking/validate-coupon', protect, requireRole("user"), asyncHandler(validateCoupon))
router.get('/public-coupons', asyncHandler(getPublicCoupons))
router.get('/my-tickets',protect,requireRole("user"),asyncHandler(getUserTickets))
router.patch('/booking/cancel-ticket/:ticketId',protect,requireRole("user"),asyncHandler(cancelTicket))
router.get('/booking/cancel-ticket/:ticketId',protect,requireRole("user"),asyncHandler(cancelTicket))
router.patch('/booking/cancel-booking/:bookingId',protect,requireRole("user"),asyncHandler(cancelBooking))

// User Wallet Routes (Razorpay Deposit, Verification, Ledger Details, and Withdrawal)
router.post('/wallet/create-order', protect, requireRole("user"), asyncHandler(createUserWalletOrder))
router.post('/wallet/verify-payment', protect, requireRole("user"), asyncHandler(verifyUserWalletPayment))
router.post('/wallet/record-failure', protect, requireRole("user"), asyncHandler(recordUserWalletFailure))
router.get('/wallet/details', protect, requireRole("user"), asyncHandler(getUserWalletDetails))
router.post('/wallet/withdraw', protect, requireRole("user"), asyncHandler(requestUserWithdrawal))

// Organizer Review & Rating Routes
router.post('/reviews', protect, requireRole("user"), createReviewValidation, validate, asyncHandler(createOrganizerReview))
router.get('/reviews/my-reviews', protect, requireRole("user"), asyncHandler(getMyReviews))
router.get('/reviews/event/:eventId', protect, requireRole("user"), asyncHandler(getEventReviewStatus))
router.get('/reviews/organizer/:vendorId', protect, requireRole("user"), asyncHandler(getOrganizerReviews))

// Notification Routes
router.get('/notifications', protect, asyncHandler(getMyNotifications))
router.patch('/notifications/mark-read', protect, asyncHandler(markMyNotificationsRead))
router.delete('/notifications/clear-all', protect, asyncHandler(clearAllMyNotifications))
router.delete('/notifications/:id', protect, asyncHandler(deleteMyNotification))

export default router
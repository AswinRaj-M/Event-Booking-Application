import express from 'express'
import { HTTP_STATUS } from '../utils/enums/http.status.enum.js'
import {
  applyVendor,
  verifyVendorOTP,
  resendVendorOtp,
  vendorLogin,
  vendorLogout,
} from "../controllers/vendor/auth.controller.js"
import {
  vendorProfile,
  updateVendorProfile,
  updateVendorImages,
  sendVendorEmailUpdateOtp,
  verifyVendorEmailUpdateOtp,
  resendVendorEmailUpdateOtp,
} from "../controllers/vendor/profile.controller.js"
import {
  addVendorPortfolio,
  deleteVendorPortfolio,
  deleteVendorImage,
} from "../controllers/vendor/portfolio.controller.js"
import {
  createEvent,
  updateEvent,
  getVendorEvents,
  cancelEvent,
  deleteEvent,
} from "../controllers/vendor/event.controller.js"
import upload from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  vendorApplyValidation,
  vendorLoginValidation,
  vendorProfileUpdateValidation,
  eventCreateValidation,
  eventUpdateValidation
} from '../validations/vendor.validation.js'

const router = express.Router()

router.post(
  "/application",
  upload.fields([
    { name: "businessDocument", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  vendorApplyValidation,
  validate,
  asyncHandler(applyVendor)
)

router.post("/verify-otp", asyncHandler(verifyVendorOTP))
router.post("/resend-otp", asyncHandler(resendVendorOtp))

router.post("/login", vendorLoginValidation, validate, asyncHandler(vendorLogin))
router.get('/profile',protect,asyncHandler(vendorProfile),requireRole("vendor"))
router.patch('/profile/images',
  protect,
  requireRole("vendor"),
  upload.fields([
    {name : "profilePicture",maxCount : 1},
    {name : "coverImage",maxCount : 1}
  ]),
  asyncHandler(updateVendorImages)
)
router.put('/update-profile', protect, requireRole("vendor"), vendorProfileUpdateValidation, validate, asyncHandler(updateVendorProfile))
router.post('/send-email-update-otp', protect, requireRole("vendor"), asyncHandler(sendVendorEmailUpdateOtp))
router.post('/verify-email-update-otp', protect, requireRole("vendor"), vendorProfileUpdateValidation, validate, asyncHandler(verifyVendorEmailUpdateOtp))
router.post('/resend-email-update-otp', protect, requireRole("vendor"), asyncHandler(resendVendorEmailUpdateOtp))
router.post('/profile/portfolios', protect, requireRole("vendor"), upload.single('portfolio'), asyncHandler(addVendorPortfolio))
router.delete('/profile/remove-portfolios/:portfolioId', protect, requireRole("vendor"), asyncHandler(deleteVendorPortfolio))
router.delete('/profile/remove-images/:imageType', protect, requireRole("vendor"), asyncHandler(deleteVendorImage))
router.post(
  "/create-event",
  protect,
  upload.fields([
    {name : "thumbnail",maxCount : 1},
    {name : "images" , maxCount : 10}
  ]),
  eventCreateValidation,
  validate,
  asyncHandler(createEvent)
)

router.get("/my-events", protect, requireRole("vendor"), asyncHandler(getVendorEvents))
router.patch("/cancel-event/:eventId", protect, requireRole("vendor"), asyncHandler(cancelEvent))
router.put(
  "/update-event/:eventId",
  protect,
  requireRole("vendor"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  eventUpdateValidation,
  validate,
  asyncHandler(updateEvent)
)
router.delete("/delete-event/:eventId", protect, requireRole("vendor"), asyncHandler(deleteEvent))

router.post("/logout", protect, requireRole("vendor"), asyncHandler(vendorLogout))
router.get("/status", protect, requireRole("vendor"), (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    status: req.user.applicationStatus,
    isBlocked: req.user.isBlocked
  });
})

export default router
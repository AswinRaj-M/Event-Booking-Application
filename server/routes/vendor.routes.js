import express from 'express'
import { applyVendor,
   updateVendorImages, 
   vendorLogin, 
   vendorLogout,
   vendorProfile,
   addVendorPortfolio,
   deleteVendorImage,
   deleteVendorPortfolio,
   updateVendorProfile,
   } from "../controllers/vendor.controller.js"
import upload from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  vendorApplyValidation,
  vendorLoginValidation
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
router.put('/update-profile', protect, requireRole("vendor"), asyncHandler(updateVendorProfile))
router.post('/profile/portfolios', protect, requireRole("vendor"), upload.single('portfolio'), asyncHandler(addVendorPortfolio))
router.delete('/profile/remove-portfolios/:portfolioId', protect, requireRole("vendor"), asyncHandler(deleteVendorPortfolio))
router.delete('/profile/remove-images/:imageType', protect, requireRole("vendor"), asyncHandler(deleteVendorImage))
router.post("/logout", protect, requireRole("vendor"), asyncHandler(vendorLogout))
router.get("/status", protect, requireRole("vendor"), (req, res) => {
  res.status(200).json({
    success: true,
    status: req.user.applicationStatus,
    isBlocked: req.user.isBlocked
  });
})

export default router
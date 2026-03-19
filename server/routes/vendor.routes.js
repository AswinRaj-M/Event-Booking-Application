import express from 'express'
import { applyVendor, vendorLogin, vendorLogout, getVendorMe } from "../controllers/vendor.controller.js"
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
router.post("/logout", protect, requireRole("vendor"), asyncHandler(vendorLogout))
router.get("/me", protect, requireRole("vendor"), asyncHandler(getVendorMe))

export default router
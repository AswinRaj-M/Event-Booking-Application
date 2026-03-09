import express from 'express'
import { applyVendor } from "../controllers/vendor.controller.js"
import upload from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.post(
  "/application",
  upload.fields([
    { name: "businessDocument", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  asyncHandler(applyVendor)
)

export default router
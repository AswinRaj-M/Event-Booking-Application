import express from 'express'
import {
  applyVendor
} from "../controllers/vendor.controller.js"

import upload from '../middleware/upload.js'


const router = express.Router()

router.post(
  "/application",
  upload.fields([
    {name : "businessDocument", maxCount : 1},
    {name : "idProof",maxCount : 1}
  ]),
  applyVendor
)

export default router
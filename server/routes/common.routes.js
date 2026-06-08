import express from 'express'
import { getAllCategories } from '../controllers/admin.controller.js'
import { asyncHandler } from '../middleware/error.middleware.js'

const router = express.Router()

router.get('/categories', asyncHandler(getAllCategories))

export default router
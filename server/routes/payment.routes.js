import express from "express";
import { 
  createRazorpayOrder, 
  verifyPayment, 
  recordPaymentFailure,
  getPaymentById, 
  getUserPayments 
} from "../controllers/user/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = express.Router();

// Apply auth protection middleware to all payment endpoints
router.use(protect, requireRole("user"));

router.post("/create-order", asyncHandler(createRazorpayOrder));
router.post("/verify", asyncHandler(verifyPayment));
router.post("/fail", asyncHandler(recordPaymentFailure));
router.get("/user", asyncHandler(getUserPayments));
router.get("/:id", asyncHandler(getPaymentById));

export default router;

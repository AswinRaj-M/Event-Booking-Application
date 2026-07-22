import { 
  createRazorpayOrderService, 
  verifyPaymentSignatureService,
  recordPaymentFailureService,
  getPaymentByIdService,
  getUserPaymentsService
} from "../../services/user/payment.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * @desc Create Razorpay Order
 * @route POST /api/payments/create-order
 * @access Private (User)
 */
export const createRazorpayOrder = async (req, res) => {
  const userId = req.user._id;
  const { eventId, tierId, quantity, couponCode } = req.body;

  const result = await createRazorpayOrderService(userId, {
    eventId,
    tierId,
    quantity,
    couponCode
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Razorpay order created successfully",
    ...result
  });
};

/**
 * @desc Verify Payment Signature (Server-side HMAC SHA256)
 * @route POST /api/payments/verify
 * @access Private (User)
 */
export const verifyPayment = async (req, res) => {
  const userId = req.user._id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const result = await verifyPaymentSignatureService(userId, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });

  return res.status(HTTP_STATUS.OK).json(result);
};

/**
 * @desc Record Payment Cancellation / Failure
 * @route POST /api/payments/fail
 * @access Private (User)
 */
export const recordPaymentFailure = async (req, res) => {
  const userId = req.user._id;
  const { razorpay_order_id, status, reason } = req.body;

  const result = await recordPaymentFailureService(userId, {
    razorpay_order_id,
    status,
    reason
  });

  return res.status(HTTP_STATUS.OK).json(result);
};

/**
 * @desc Get Payment Details by ID
 * @route GET /api/payments/:id
 * @access Private (User)
 */
export const getPaymentById = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const payment = await getPaymentByIdService(userId, id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    payment
  });
};

/**
 * @desc Get All Payments for Current User
 * @route GET /api/payments/user
 * @access Private (User)
 */
export const getUserPayments = async (req, res) => {
  const userId = req.user._id;

  const payments = await getUserPaymentsService(userId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    payments
  });
};

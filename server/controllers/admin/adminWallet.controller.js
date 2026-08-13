import {
  createAdminWalletOrderService,
  verifyAdminWalletPaymentService,
  recordAdminWalletPaymentFailureService,
  getAdminWalletDetailsService,
} from "../../services/admin/adminWallet.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * Create Razorpay Order for Admin Wallet Deposit
 * POST /api/admin/wallet/create-order
 */
export const createAdminWalletOrder = async (req, res) => {
  const adminId = req.user._id;
  const { amount } = req.body;

  const orderData = await createAdminWalletOrderService(adminId, amount);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Razorpay order created successfully for admin wallet deposit",
    ...orderData,
  });
};

/**
 * Verify Razorpay Payment and Credit Admin Wallet
 * POST /api/admin/wallet/verify-payment
 */
export const verifyAdminWalletPayment = async (req, res) => {
  const adminId = req.user._id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const result = await verifyAdminWalletPaymentService(adminId, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};

/**
 * Record Payment Failure or Cancellation
 * POST /api/admin/wallet/record-failure
 */
export const recordAdminWalletPaymentFailure = async (req, res) => {
  const adminId = req.user._id;
  const { razorpay_order_id, reason } = req.body;

  const result = await recordAdminWalletPaymentFailureService(adminId, {
    razorpay_order_id,
    reason,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};

/**
 * Get Admin Wallet Details, Financial KPIs, and Transaction History
 * GET /api/admin/wallet/details
 */
export const getAdminWalletDetails = async (req, res) => {
  const adminId = req.user._id;
  const queryParams = req.query;

  const data = await getAdminWalletDetailsService(adminId, queryParams);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
  });
};

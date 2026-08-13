import {
  createUserWalletOrderService,
  verifyUserWalletPaymentService,
  recordUserWalletFailureService,
  getUserWalletDetailsService,
  requestUserWithdrawalService,
} from "../../services/user/userWallet.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * POST /api/users/wallet/create-order
 */
export const createUserWalletOrder = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { amount } = req.body;

  const result = await createUserWalletOrderService(userId, amount);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Razorpay order created successfully for wallet top-up",
    data: result,
  });
};

/**
 * POST /api/users/wallet/verify-payment
 */
export const verifyUserWalletPayment = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const result = await verifyUserWalletPaymentService(userId, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
    data: result,
  });
};

/**
 * POST /api/users/wallet/record-failure
 */
export const recordUserWalletFailure = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { razorpay_order_id, reason } = req.body;

  const result = await recordUserWalletFailureService(userId, {
    razorpay_order_id,
    reason,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
  });
};

/**
 * GET /api/users/wallet/details
 */
export const getUserWalletDetails = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { page, limit, transactionType, status } = req.query;

  const result = await getUserWalletDetailsService(userId, {
    page,
    limit,
    transactionType,
    status,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
};

/**
 * POST /api/users/wallet/withdraw
 */
export const requestUserWithdrawal = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { amount, payoutMethod, accountDetails } = req.body;

  const result = await requestUserWithdrawalService(userId, {
    amount,
    payoutMethod,
    accountDetails,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
    data: result,
  });
};

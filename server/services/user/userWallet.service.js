import mongoose from "mongoose";
import { getRazorpayInstance, verifyRazorpaySignature } from "../../config/razorpay.config.js";
import {
  findUserWalletRepo,
  updateUserWalletBalanceRepo,
  createUserWalletTransactionRepo,
  findUserWalletTransactionsRepo,
  createUserDepositPaymentRepo,
  findUserDepositPaymentByOrderIdRepo,
  updateUserDepositPaymentRepo,
} from "../../repository/user/userWallet.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

const MAX_DEPOSIT_AMOUNT = 100000; // ₹1,00,000 maximum single deposit limit
const MIN_DEPOSIT_AMOUNT = 1; // ₹1 minimum single deposit

/**
 * STEP 1: Create Razorpay Order for User Wallet Deposit
 */
export const createUserWalletOrderService = async (userId, amount) => {
  if (!userId) {
    throw new AppError("Unauthorized. User ID is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    throw new AppError("Please enter a valid numeric amount.", HTTP_STATUS.BAD_REQUEST);
  }

  if (numAmount < MIN_DEPOSIT_AMOUNT) {
    throw new AppError(`Deposit amount must be at least ₹${MIN_DEPOSIT_AMOUNT}.`, HTTP_STATUS.BAD_REQUEST);
  }

  if (numAmount > MAX_DEPOSIT_AMOUNT) {
    throw new AppError(
      `Deposit amount cannot exceed ₹${MAX_DEPOSIT_AMOUNT.toLocaleString("en-IN")}.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Enforce maximum 2 decimal places
  const formattedAmount = Number(numAmount.toFixed(2));

  // Convert amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(formattedAmount * 100);

  const receipt = `receipt_usr_${userId.toString().slice(-6)}_${Date.now()}`;
  const razorpay = getRazorpayInstance();

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: userId.toString(),
        type: "user-wallet-deposit",
      },
    });
  } catch (err) {
    console.error("[Razorpay User Order Creation Error]:", err);
    throw new AppError(
      err.error?.description || "Failed to create payment order with payment gateway.",
      HTTP_STATUS.BAD_GATEWAY
    );
  }

  // Persist Payment record in database with CREATED status
  const payment = await createUserDepositPaymentRepo({
    userId,
    amount: formattedAmount,
    currency: "INR",
    razorpayOrderId: order.id,
    status: "CREATED",
    paymentMethod: "razorpay",
    receipt,
    paymentType: "user-wallet-deposit",
    notes: {
      userId: userId.toString(),
      type: "user-wallet-deposit",
    },
  });

  return {
    key: process.env.RAZORPAY_KEY_ID,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt,
    paymentId: payment._id,
  };
};

/**
 * STEP 2: Verify Razorpay Payment and Credit User Wallet
 */
export const verifyUserWalletPaymentService = async (
  userId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  if (!userId) {
    throw new AppError("Unauthorized. User ID is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      "Incomplete payment verification payload. Order ID, Payment ID, and Signature are required.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 1. Fetch Payment record from database
  const payment = await findUserDepositPaymentByOrderIdRepo(razorpay_order_id);
  if (!payment) {
    throw new AppError(
      "Payment record not found for the provided Razorpay Order ID.",
      HTTP_STATUS.NOT_FOUND
    );
  }

  // 2. Ownership verification
  const paymentUserId = payment.userId?._id ? payment.userId._id.toString() : payment.userId.toString();
  if (paymentUserId !== userId.toString()) {
    throw new AppError(
      "Security violation: Payment does not belong to the authenticated user.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  // 3. Idempotency Check: Prevent duplicate crediting
  if (payment.status === "SUCCESS") {
    const user = await findUserWalletRepo(userId);
    return {
      success: true,
      message: "Payment was already verified and credited previously.",
      alreadyProcessed: true,
      newBalance: user?.walletBalance || 0,
    };
  }

  // 4. Verify Razorpay cryptographic HMAC-SHA256 signature
  const isSignatureValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isSignatureValid) {
    await updateUserDepositPaymentRepo(razorpay_order_id, {
      status: "FAILED",
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      notes: { ...payment.notes, failureReason: "Invalid Razorpay HMAC signature" },
    });

    throw new AppError(
      "Payment signature verification failed. Possible tampering detected.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 5. Update Payment record to SUCCESS
  await updateUserDepositPaymentRepo(razorpay_order_id, {
    status: "SUCCESS",
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  // 6. Credit User walletBalance
  const updatedUser = await updateUserWalletBalanceRepo(userId, payment.amount);

  // 7. Create UserWalletTransaction record
  const transaction = await createUserWalletTransactionRepo({
    userId,
    transactionType: "deposit",
    amount: payment.amount,
    currency: "INR",
    balanceAfter: updatedUser?.walletBalance || payment.amount,
    status: "completed",
    paymentMethod: "razorpay",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    description: `Wallet top-up via Razorpay (${razorpay_payment_id})`,
    metadata: {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    },
  });

  return {
    success: true,
    message: `₹${payment.amount.toFixed(2)} credited to your wallet successfully!`,
    creditedAmount: payment.amount,
    newBalance: updatedUser?.walletBalance || 0,
    transaction,
  };
};

/**
 * STEP 3: Record Payment Failure / Cancellation
 */
export const recordUserWalletFailureService = async (
  userId,
  { razorpay_order_id, reason = "Payment cancelled by user" }
) => {
  if (!razorpay_order_id) {
    throw new AppError("Razorpay order ID is required.", HTTP_STATUS.BAD_REQUEST);
  }

  const payment = await findUserDepositPaymentByOrderIdRepo(razorpay_order_id);
  if (!payment) return { success: false, message: "Payment not found" };

  if (payment.status === "CREATED" || payment.status === "PENDING") {
    await updateUserDepositPaymentRepo(razorpay_order_id, {
      status: "FAILED",
      notes: { ...payment.notes, failureReason: reason },
    });
  }

  return { success: true, message: "Payment marked as failed/cancelled" };
};

/**
 * STEP 4: Get User Wallet Details & Transaction History
 */
export const getUserWalletDetailsService = async (userId, query = {}) => {
  const user = await findUserWalletRepo(userId);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const txData = await findUserWalletTransactionsRepo(userId, query);

  return {
    walletBalance: user.walletBalance || 0,
    transactions: txData.transactions,
    total: txData.total,
    page: txData.page,
    totalPages: txData.totalPages,
  };
};

/**
 * STEP 5: Request User Withdrawal
 */
export const requestUserWithdrawalService = async (userId, { amount, payoutMethod, accountDetails }) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 10) {
    throw new AppError("Minimum withdrawal amount is ₹10.00", HTTP_STATUS.BAD_REQUEST);
  }
  if (numAmount > 5000) {
    throw new AppError("Maximum withdrawal limit per transaction is ₹5,000.00", HTTP_STATUS.BAD_REQUEST);
  }
  if (!payoutMethod) {
    throw new AppError("Payout method is required", HTTP_STATUS.BAD_REQUEST);
  }

  const user = await findUserWalletRepo(userId);
  if (!user || (user.walletBalance || 0) < numAmount) {
    throw new AppError("Insufficient wallet balance for this withdrawal.", HTTP_STATUS.BAD_REQUEST);
  }

  // Prevent Duplicate Pending Requests
  const { findPendingWithdrawalByUserIdRepo } = await import("../../repository/vendor/withdrawal.repo.js");
  const existingPending = await findPendingWithdrawalByUserIdRepo(userId);
  if (existingPending) {
    throw new AppError(
      "You already have a pending withdrawal request under review. Please wait for admin approval.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Create Pending Withdrawal Request (Money is NOT deducted yet until admin approves)
  const WithdrawalRequest = (await import("../../models/withdrawalRequest.model.js")).default;
  const withdrawalRequest = await WithdrawalRequest.create({
    userId,
    userType: "user",
    amount: numAmount,
    paymentMethod: payoutMethod || "UPI / GPay",
    destinationAccount: accountDetails || payoutMethod || "UPI / GPay",
    status: "pending",
    requestedAt: new Date(),
  });

  // Create Pending UserWalletTransaction Record (so it immediately shows as 'Processing' in User Ledger)
  const transaction = await createUserWalletTransactionRepo({
    userId,
    transactionType: "withdrawal",
    amount: -numAmount,
    currency: "INR",
    balanceAfter: user.walletBalance || 0,
    status: "pending",
    paymentMethod: payoutMethod || "UPI / GPay",
    description: `Withdrawal request to ${accountDetails || payoutMethod}`,
    metadata: {
      withdrawalRequestId: withdrawalRequest._id,
      payoutMethod,
      accountDetails,
    },
  });

  return {
    success: true,
    message: `Withdrawal request for ₹${numAmount.toFixed(2)} submitted successfully and is pending admin approval!`,
    newBalance: user.walletBalance || 0,
    withdrawal: withdrawalRequest,
    transaction,
  };
};

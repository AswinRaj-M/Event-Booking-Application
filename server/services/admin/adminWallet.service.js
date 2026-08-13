import mongoose from "mongoose";
import { getRazorpayInstance, verifyRazorpaySignature } from "../../config/razorpay.config.js";
import {
  findOrCreateAdminWalletRepo,
  updateAdminWalletBalanceRepo,
  createAdminWalletTransactionRepo,
  findAdminWalletTransactionsRepo,
  createDepositPaymentRepo,
  findDepositPaymentByOrderIdRepo,
  updateDepositPaymentRepo,
} from "../../repository/admin/adminWallet.repo.js";
import WithdrawalRequest from "../../models/withdrawalRequest.model.js";
import WalletTransaction from "../../models/walletTransaction.model.js";
import Booking from "../../models/booking.model.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

const MAX_DEPOSIT_AMOUNT = 500000; // ₹5,00,000 maximum single deposit limit

/**
 * STEP 1: Create Razorpay Order for Admin Wallet Deposit
 */
export const createAdminWalletOrderService = async (adminId, amount) => {
  if (!adminId) {
    throw new AppError("Unauthorized. Admin ID is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    throw new AppError("Please enter a valid numeric amount.", HTTP_STATUS.BAD_REQUEST);
  }

  if (numAmount <= 0) {
    throw new AppError("Deposit amount must be strictly greater than ₹0.", HTTP_STATUS.BAD_REQUEST);
  }

  if (numAmount > MAX_DEPOSIT_AMOUNT) {
    throw new AppError(
      `Deposit amount cannot exceed ₹${MAX_DEPOSIT_AMOUNT.toLocaleString("en-IN")}.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Enforce valid currency decimals (maximum 2 decimal places)
  const formattedAmount = Number(numAmount.toFixed(2));

  // Convert amount to smallest currency unit (paise for INR)
  const amountInPaise = Math.round(formattedAmount * 100);

  const receipt = `receipt_adm_${adminId.toString().slice(-6)}_${Date.now()}`;
  const razorpay = getRazorpayInstance();

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        adminId: adminId.toString(),
        type: "admin-wallet-deposit",
      },
    });
  } catch (err) {
    console.error("[Razorpay Order Creation Error]:", err);
    throw new AppError(
      err.error?.description || "Failed to create payment order with payment gateway.",
      HTTP_STATUS.BAD_GATEWAY
    );
  }

  // Persist Payment record in database with CREATED status
  const payment = await createDepositPaymentRepo({
    userId: adminId,
    amount: formattedAmount,
    currency: "INR",
    razorpayOrderId: order.id,
    status: "CREATED",
    paymentMethod: "razorpay",
    receipt,
    paymentType: "admin-wallet-deposit",
    notes: {
      adminId: adminId.toString(),
      type: "admin-wallet-deposit",
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
 * STEP 2: Verify Razorpay Payment and Credit Admin Wallet Atomically
 */
export const verifyAdminWalletPaymentService = async (
  adminId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  if (!adminId) {
    throw new AppError("Unauthorized. Admin ID is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      "Incomplete payment verification payload. Order ID, Payment ID, and Signature are required.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 1. Fetch Payment record from database
  const payment = await findDepositPaymentByOrderIdRepo(razorpay_order_id);
  if (!payment) {
    throw new AppError(
      "Payment record not found for the provided Razorpay Order ID.",
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Ensure security: Only the admin who initiated the order can verify and receive credit
  const paymentUserId = payment.userId?._id ? payment.userId._id.toString() : payment.userId.toString();
  if (paymentUserId !== adminId.toString()) {
    throw new AppError(
      "Access denied. You cannot verify a payment created by another account.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  // 2. IDEMPOTENCY CHECK: If payment is already SUCCESS, avoid double crediting
  if (payment.status === "SUCCESS") {
    const existingWallet = await findOrCreateAdminWalletRepo(adminId);
    return {
      success: true,
      message: "Payment already processed and wallet credited.",
      alreadyProcessed: true,
      balance: existingWallet.balance,
    };
  }

  // 3. Verify Razorpay HMAC SHA256 Signature Server-side
  const isSignatureValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isSignatureValid) {
    // Record payment failure on invalid signature
    await updateDepositPaymentRepo(razorpay_order_id, {
      status: "FAILED",
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      notes: { ...payment.notes, failureReason: "Invalid HMAC signature" },
    });

    throw new AppError(
      "Payment verification failed. Invalid digital signature detected.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 4. Update Database (Payment SUCCESS -> Credit Admin Wallet -> Ledger Transaction)
  const depositAmount = Number(payment.amount);
  
  // A. Mark Payment as SUCCESS
  await updateDepositPaymentRepo(razorpay_order_id, {
    status: "SUCCESS",
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  // B. Find or create AdminWallet
  const wallet = await findOrCreateAdminWalletRepo(adminId);

  // C. Credit AdminWallet balance & totalDeposited
  const updatedWallet = await updateAdminWalletBalanceRepo(wallet._id, {
    balanceInc: depositAmount,
    totalDepositedInc: depositAmount,
  });

  // D. Create AdminWalletTransaction ledger record
  const transaction = await createAdminWalletTransactionRepo({
    walletId: wallet._id,
    adminId,
    transactionType: "deposit",
    amount: depositAmount,
    currency: "INR",
    status: "completed",
    paymentMethod: "razorpay",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    description: "Admin wallet deposit via Razorpay",
    metadata: {
      receipt: payment.receipt,
    },
  });

  return {
    success: true,
    message: `₹${depositAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} added to your wallet successfully.`,
    newBalance: updatedWallet.balance,
    transaction,
  };
};

/**
 * Record payment failure / cancellation
 */
export const recordAdminWalletPaymentFailureService = async (
  adminId,
  { razorpay_order_id, reason = "Payment cancelled by user" }
) => {
  if (!adminId || !razorpay_order_id) return;

  const payment = await findDepositPaymentByOrderIdRepo(razorpay_order_id);
  if (payment && payment.status === "CREATED") {
    await updateDepositPaymentRepo(razorpay_order_id, {
      status: "FAILED",
      notes: { ...payment.notes, failureReason: reason },
    });
  }

  return {
    success: true,
    message: "Payment status updated to failed/cancelled.",
  };
};

/**
 * Get Admin Wallet details, financial KPIs, and transaction history
 */
export const getAdminWalletDetailsService = async (adminId, queryParams = {}) => {
  if (!adminId) {
    throw new AppError("Admin ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const wallet = await findOrCreateAdminWalletRepo(adminId);

  // Fetch real financial aggregations across platform
  const [withdrawalStats, commissionStats, couponStats, walletTxData] = await Promise.all([
    // Approved & Pending Withdrawals
    WithdrawalRequest.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    // Platform commission earned from vendor earnings transactions
    WalletTransaction.aggregate([
      { $match: { transactionType: "earnings", status: "completed" } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$platformCommission" },
        },
      },
    ]),
    // Coupon discounts absorbed/funded by platform across confirmed bookings
    Booking.aggregate([
      { $match: { paymentStatus: "paid", couponDiscount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalCouponSponsored: { $sum: "$couponDiscount" },
        },
      },
    ]),
    // Admin deposit / wallet transactions
    findAdminWalletTransactionsRepo(adminId, queryParams),
  ]);

  let vendorPayouts = 0;
  let pendingWithdrawalsAmount = 0;

  withdrawalStats.forEach((stat) => {
    if (stat._id === "approved") {
      vendorPayouts = stat.totalAmount || 0;
    } else if (stat._id === "pending") {
      pendingWithdrawalsAmount = stat.totalAmount || 0;
    }
  });

  const commissionEarned = commissionStats[0]?.totalCommission || 0;
  const totalCouponCostSponsored = couponStats[0]?.totalCouponSponsored || 0;
  const netPlatformRevenue = Number((commissionEarned - totalCouponCostSponsored).toFixed(2));

  return {
    wallet: {
      id: wallet._id,
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      currency: wallet.currency,
      isActive: wallet.isActive,
    },
    metrics: {
      platformBalance: wallet.balance,
      vendorPayouts,
      pendingWithdrawalsAmount,
      commissionEarned,
      totalCouponCostSponsored,
      netPlatformRevenue,
    },
    transactions: walletTxData.transactions,
    pagination: {
      total: walletTxData.total,
      page: walletTxData.page,
      totalPages: walletTxData.totalPages,
    },
  };
};

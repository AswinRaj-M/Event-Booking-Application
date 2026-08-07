import Event from "../../models/event.model.js";
import WalletTransaction from "../../models/walletTransaction.model.js";
import { getPlatformCommissionRate } from "../../config/commission.config.js";
import {
  findOrCreateWalletRepo,
  updateWalletBalanceRepo,
  createWalletTransactionRepo,
  findTransactionByBookingIdRepo,
  findWalletByVendorIdRepo,
  getWalletTransactionsRepo,
} from "../../repository/vendor/vendorWallet.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * STEP 78: Vendor Gross Earnings Calculation (Reusable)
 */
export const calculateVendorGrossEarnings = (bookingAmount) => {
  const gross = Number(bookingAmount);
  if (isNaN(gross) || gross < 0) {
    return 0;
  }
  return Number(gross.toFixed(2));
};

/**
 * STEP 79: Platform Commission & Vendor Net Earnings Deduction (Reusable)
 */
export const calculatePlatformCommission = (grossAmount, customCommissionRate) => {
  const gross = calculateVendorGrossEarnings(grossAmount);
  const commissionRate =
    customCommissionRate !== undefined && customCommissionRate !== null
      ? Number(customCommissionRate)
      : getPlatformCommissionRate();

  const platformCommission = Number(((gross * commissionRate) / 100).toFixed(2));
  const netEarnings = Number((gross - platformCommission).toFixed(2));

  return {
    grossAmount: gross,
    commissionPercentage: commissionRate,
    platformCommission,
    netEarnings,
  };
};

/**
 * STEPS 78 - 81: Process & Credit Vendor Earnings for a Successful Booking
 * Called automatically after booking payment confirmation.
 */
export const processVendorBookingEarnings = async (booking) => {
  if (!booking || !booking._id) {
    throw new AppError("Invalid booking details for wallet processing", HTTP_STATUS.BAD_REQUEST);
  }

  // Edge Case: Prevent duplicate payment processing (Replay / Duplicate Webhook check)
  const existingTransaction = await findTransactionByBookingIdRepo(booking._id);
  if (existingTransaction) {
    console.log(`[Wallet] Transaction already processed for booking: ${booking._id}`);
    return existingTransaction;
  }

  // Retrieve associated event to get vendorId (support both populated document & ObjectId)
  let event = booking.eventId;
  if (!event || typeof event !== "object" || !event.vendorId) {
    const eventId = booking.eventId?._id || booking.eventId;
    event = await Event.findById(eventId);
  }

  if (!event) {
    console.error(`[Wallet] Event not found for booking: ${booking._id}`);
    return null;
  }

  const vendorId = event.vendorId?._id || event.vendorId;
  if (!vendorId) {
    console.error(`[Wallet] Vendor ID missing for event: ${event._id}`);
    return null;
  }

  // STEP 78 & 79: Calculate Gross Earnings, Platform Commission, & Net Vendor Earnings
  const grossAmount = booking.totalAmount || (booking.ticketPrice * (booking.quantity || 1)) || 0;
  const earningsData = calculatePlatformCommission(grossAmount);

  // STEP 80: Find or Create Vendor Wallet & Update Available Balance & Total Earnings
  const wallet = await findOrCreateWalletRepo(vendorId);

  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: earningsData.netEarnings,
    totalEarningsInc: earningsData.netEarnings,
    pendingBalanceInc: 0,
  });

  // STEP 81: Store Wallet Transaction History
  const transaction = await createWalletTransactionRepo({
    walletId: wallet._id,
    vendorId: vendorId,
    bookingId: booking._id,
    eventId: event._id,
    transactionType: "earnings",
    amount: earningsData.grossAmount,
    platformCommission: earningsData.platformCommission,
    netAmount: earningsData.netEarnings,
    status: "completed",
    description: `Ticket sales earnings for event: ${event.title}`,
    createdTime: new Date(),
  });

  return {
    wallet: updatedWallet,
    transaction,
    earningsData,
  };
};

/**
 * Process & Deduct Vendor Wallet Balance for a Booking Refund (Booking-Level)
 * Creates ONLY ONE WalletTransaction per booking refund.
 */
export const processVendorBookingRefund = async (booking) => {
  if (!booking || !booking._id) return null;

  // 1. Idempotency Check: Prevent duplicate refund transactions for the same bookingId
  const existingRefundTx = await WalletTransaction.findOne({
    bookingId: booking._id,
    transactionType: "refund",
  });
  if (existingRefundTx) {
    console.log(`[Wallet] Refund transaction already processed for booking: ${booking._id}`);
    return existingRefundTx;
  }

  // Retrieve associated event to get vendorId (support both populated document & ObjectId)
  let event = booking.eventId;
  if (!event || typeof event !== "object" || !event.vendorId) {
    const eventId = booking.eventId?._id || booking.eventId;
    event = await Event.findById(eventId);
  }

  if (!event || !event.vendorId) {
    console.error(`[Wallet Refund] Event or Vendor ID not found for booking: ${booking._id}`);
    return null;
  }

  const vendorId = event.vendorId?._id || event.vendorId;

  // 2. Calculate Total Booking Refund Amount & Commission
  const grossAmount = booking.totalAmount || (booking.ticketPrice * (booking.quantity || 1)) || 0;
  const earningsData = calculatePlatformCommission(grossAmount);

  const wallet = await findOrCreateWalletRepo(vendorId);

  // 3. Deduct total net vendor earnings from Available Balance & Total Earnings safely
  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: -earningsData.netEarnings,
    totalEarningsInc: -earningsData.netEarnings,
    pendingBalanceInc: 0,
  });

  // 4. Create ONLY ONE WalletTransaction record for the entire booking refund
  const bookingCode = booking.bookingId || booking._id;
  const transaction = await createWalletTransactionRepo({
    walletId: wallet._id,
    vendorId: vendorId,
    bookingId: booking._id,
    eventId: event._id,
    transactionType: "refund",
    amount: -earningsData.grossAmount,
    platformCommission: -earningsData.platformCommission,
    netAmount: -earningsData.netEarnings,
    status: "completed",
    description: `Booking cancellation refund for "${event.title}"`,
    createdTime: new Date(),
  });

  return {
    wallet: updatedWallet,
    transaction,
  };
};

/**
 * Get Vendor Wallet Details
 */
export const getVendorWalletService = async (vendorId) => {
  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }
  const wallet = await findOrCreateWalletRepo(vendorId);
  return wallet;
};

/**
 * Get Vendor Wallet Transactions List
 */
export const getVendorTransactionsService = async (vendorId, options = {}) => {
  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }
  return await getWalletTransactionsRepo(vendorId, options);
};

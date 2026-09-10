import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import WalletTransaction from "../../models/walletTransaction.model.js";
import WithdrawalRequest from "../../models/withdrawalRequest.model.js";
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
 * Vendor Ticket Earnings Calculation
 * Vendor receives 100% of the vendor ticket price (Ticket Price x Quantity).
 * Platform fee is credited separately to the Admin wallet.
 */
export const calculateVendorGrossEarnings = (ticketPrice, quantity = 1) => {
  const price = Number(ticketPrice) || 0;
  const qty = Number(quantity) || 1;
  return Number((price * qty).toFixed(2));
};

export const calculatePlatformCommission = (grossAmount) => {
  const gross = Number(grossAmount) || 0;
  return {
    grossAmount: gross,
    commissionPercentage: 0,
    platformCommission: 0,
    netEarnings: gross,
  };
};

/**
 * Process & Credit Vendor Earnings for a Successful Booking
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

  // Calculate exact Vendor Ticket Amount (Vendor Ticket Price x Quantity)
  const vendorTicketAmount = Number(booking.originalAmount) > 0 
    ? Number(booking.originalAmount) 
    : (Number(booking.ticketPrice) * (Number(booking.quantity) || 1));

  const earningsData = {
    grossAmount: vendorTicketAmount,
    commissionPercentage: 0,
    platformCommission: 0,
    netEarnings: vendorTicketAmount,
  };

  // Find or Create Vendor Wallet & Update Available Balance & Total Earnings
  const wallet = await findOrCreateWalletRepo(vendorId);

  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: earningsData.netEarnings,
    totalEarningsInc: earningsData.netEarnings,
    pendingBalanceInc: 0,
  });

  // Store Wallet Transaction History
  const transaction = await createWalletTransactionRepo({
    walletId: wallet._id,
    vendorId: vendorId,
    bookingId: booking._id,
    eventId: event._id,
    transactionType: "earnings",
    amount: earningsData.grossAmount,
    platformCommission: 0,
    adminCouponDiscount: 0,
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
 * Process & Deduct Vendor Wallet Balance for a Booking Refund (Supports both Full Booking and Partial/Single Ticket cancellations)
 */
export const processVendorBookingRefund = async (
  booking,
  { isPartial = false, ticketId = null, cancelledTicketsCount = 1, totalQuantity = 1 } = {}
) => {
  if (!booking || !booking._id) return null;

  // 1. Idempotency Check: Prevent duplicate refund transactions
  const query = isPartial && ticketId
    ? { bookingId: booking._id, transactionType: "refund", description: { $regex: ticketId } }
    : { bookingId: booking._id, transactionType: "refund" };

  const existingRefundTx = await WalletTransaction.findOne(query);
  if (existingRefundTx) {
    console.log(`[Vendor Wallet] Refund transaction already processed for booking/ticket: ${booking._id}`);
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

  // Calculate Proportional Vendor Ticket Refund Amount based on cancelled tickets
  const fullVendorAmount = Number(booking.originalAmount) > 0 
    ? Number(booking.originalAmount) 
    : (Number(booking.ticketPrice) * (Number(booking.quantity) || 1));

  const count = Number(cancelledTicketsCount) || 1;
  const total = Number(totalQuantity) || (Number(booking.quantity) || 1);

  const proportionalVendorRefund = Number(((fullVendorAmount * count) / total).toFixed(2));

  const wallet = await findOrCreateWalletRepo(vendorId);

  // Deduct proportional vendor ticket earnings from Available Balance & Total Earnings
  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: -proportionalVendorRefund,
    totalEarningsInc: -proportionalVendorRefund,
    pendingBalanceInc: 0,
  });

  // Create WalletTransaction record for the refund
  const description = isPartial && ticketId
    ? `Ticket cancellation refund for "${event.title}" (${ticketId})`
    : `Booking cancellation refund for "${event.title}"`;

  const transaction = await createWalletTransactionRepo({
    walletId: wallet._id,
    vendorId: vendorId,
    bookingId: booking._id,
    eventId: event._id,
    transactionType: "refund",
    amount: -proportionalVendorRefund,
    platformCommission: 0,
    adminCouponDiscount: 0,
    netAmount: -proportionalVendorRefund,
    status: "completed",
    description,
    createdTime: new Date(),
  });

  return {
    wallet: updatedWallet,
    transaction,
    proportionalVendorRefund,
  };
};

/**
 * Get Vendor Wallet Details with Real-time Ledger Balance Synchronization
 */
export const getVendorWalletService = async (vendorId) => {
  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }
  const wallet = await findOrCreateWalletRepo(vendorId);

  try {
    const vendorObjId = new mongoose.Types.ObjectId(vendorId.toString());

    const [txStats, withdrawalStats] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { vendorId: vendorObjId, status: "completed" } },
        {
          $group: {
            _id: "$transactionType",
            totalAmount: { $sum: { $ifNull: ["$netAmount", "$amount"] } },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { vendorId: vendorObjId } },
        {
          $group: {
            _id: "$status",
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    let ledgerEarnings = 0;
    let ledgerRefunds = 0;

    txStats.forEach((stat) => {
      if (stat._id === "earnings" || stat._id === "credit") {
        ledgerEarnings += Math.abs(stat.totalAmount || 0);
      } else if (stat._id === "refund") {
        ledgerRefunds += Math.abs(stat.totalAmount || 0);
      }
    });

    let approvedWithdrawals = 0;
    let pendingWithdrawals = 0;

    withdrawalStats.forEach((w) => {
      if (w._id === "approved") {
        approvedWithdrawals += w.totalAmount || 0;
      } else if (w._id === "pending") {
        pendingWithdrawals += w.totalAmount || 0;
      }
    });

    const totalEarnings = Math.max(0, Number((ledgerEarnings - ledgerRefunds).toFixed(2)));
    const pendingBalance = Number(pendingWithdrawals.toFixed(2));
    const totalWithdrawn = Number(approvedWithdrawals.toFixed(2));
    const availableBalance = Math.max(
      0,
      Number((ledgerEarnings - ledgerRefunds - approvedWithdrawals - pendingWithdrawals).toFixed(2))
    );

    if (
      wallet.availableBalance !== availableBalance ||
      wallet.totalEarnings !== totalEarnings ||
      wallet.pendingBalance !== pendingBalance ||
      wallet.totalWithdrawn !== totalWithdrawn
    ) {
      wallet.availableBalance = availableBalance;
      wallet.totalEarnings = totalEarnings;
      wallet.pendingBalance = pendingBalance;
      wallet.totalWithdrawn = totalWithdrawn;
      await wallet.save();
    }
  } catch (err) {
    console.error("[Vendor Wallet Sync Error]:", err);
  }

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

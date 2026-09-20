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
/**
 * Vendor Ticket Revenue Calculation
 * Vendor Receivable = Effective Vendor Ticket Price = Original Ticket Subtotal - Vendor Offer Discount.
 * IMPORTANT: Admin Coupon Discount MUST NOT reduce Vendor Revenue.
 */
export const calculateVendorReceivable = (booking) => {
  if (!booking) return 0;

  if (booking.originalAmount !== undefined && booking.originalAmount !== null && !isNaN(Number(booking.originalAmount))) {
    return Math.max(0, Number(booking.originalAmount));
  }

  let subtotal = 0;
  if (Array.isArray(booking.tickets) && booking.tickets.length > 0) {
    subtotal = booking.tickets.reduce(
      (sum, t) => sum + ((Number(t.ticketPrice) || 0) * (Number(t.quantity) || 1)),
      0
    );
  } else {
    subtotal = (Number(booking.ticketPrice) || 0) * (Number(booking.quantity) || 1);
  }

  const vendorOfferDiscount = Number(booking.eventDiscount) || 0;
  return Math.max(0, Number((subtotal - vendorOfferDiscount).toFixed(2)));
};

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

  // Calculate exact Vendor Ticket Revenue (Original Ticket Price - Vendor Offer Discount, BEFORE Admin Coupon)
  const vendorTicketAmount = calculateVendorReceivable(booking);

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
  { isPartial = false, ticketId = null, ticketShare = null, cancelledTicketsCount = 1, totalQuantity = 1 } = {},
  options = {}
) => {
  if (!booking || !booking._id) return null;

  // 1. Idempotency Check: Prevent duplicate refund transactions for the same booking/ticket
  const query = isPartial && ticketId
    ? { bookingId: booking._id, transactionType: "refund", "metadata.ticketId": ticketId }
    : { bookingId: booking._id, transactionType: "refund", "metadata.isPartial": false };

  const existingRefundTx = options?.session
    ? await WalletTransaction.findOne(query).session(options.session)
    : await WalletTransaction.findOne(query);

  if (existingRefundTx) {
    console.log(`[Vendor Wallet] Refund transaction already processed for booking/ticket: ${booking._id}`);
    return existingRefundTx;
  }

  // Retrieve associated event to get vendorId (support both populated document & ObjectId)
  let event = booking.eventId;
  if (!event || typeof event !== "object" || !event.vendorId) {
    const eventId = booking.eventId?._id || booking.eventId;
    event = options?.session ? await Event.findById(eventId).session(options.session) : await Event.findById(eventId);
  }

  if (!event || !event.vendorId) {
    console.error(`[Wallet Refund] Event or Vendor ID not found for booking: ${booking._id}`);
    return null;
  }

  const vendorId = event.vendorId?._id || event.vendorId;

  // 2. Look up actual earnings transaction created during purchase if available
  let fullVendorAmount = 0;
  const existingEarningsTx = options?.session
    ? await WalletTransaction.findOne({ bookingId: booking._id, transactionType: "earnings" }).session(options.session)
    : await WalletTransaction.findOne({ bookingId: booking._id, transactionType: "earnings" });

  if (existingEarningsTx) {
    fullVendorAmount = Math.abs(Number(existingEarningsTx.netAmount ?? existingEarningsTx.amount ?? 0));
  }
  if (fullVendorAmount <= 0) {
    fullVendorAmount = calculateVendorReceivable(booking);
  }

  // 3. Determine Exact Vendor Reversal Amount
  let vendorReversalAmount = 0;
  if (!isPartial) {
    // FULL BOOKING CANCELLATION: Reverse 100% of original earnings credited (minus any prior partial refund reversals)
    const priorRefunds = options?.session
      ? await WalletTransaction.find({ bookingId: booking._id, transactionType: "refund" }).session(options.session)
      : await WalletTransaction.find({ bookingId: booking._id, transactionType: "refund" });
    const totalPriorRefunded = priorRefunds.reduce((sum, tx) => sum + Math.abs(Number(tx.netAmount ?? tx.amount ?? 0)), 0);
    vendorReversalAmount = Math.max(0, Number((fullVendorAmount - totalPriorRefunded).toFixed(2)));
  } else {
    // PARTIAL / SINGLE TICKET CANCELLATION:
    let ticketRatio = 1;
    if (ticketShare !== undefined && !isNaN(Number(ticketShare))) {
      ticketRatio = Number(ticketShare);
    } else if (ticketId && booking.tickets && booking.tickets.length > 0) {
      const targetTicket = booking.tickets.find(t => t.ticketId === ticketId);
      const combinedSubtotal = booking.tickets.reduce((sum, t) => sum + ((Number(t.ticketPrice) || 0) * (Number(t.quantity) || 1)), 0);
      if (combinedSubtotal > 0 && targetTicket && Number(targetTicket.ticketPrice) > 0) {
        ticketRatio = ((Number(targetTicket.ticketPrice) || 0) * (Number(targetTicket.quantity) || 1)) / combinedSubtotal;
      }
    }
    vendorReversalAmount = Number((fullVendorAmount * ticketRatio).toFixed(2));
  }

  const wallet = await findOrCreateWalletRepo(vendorId);

  // Deduct vendor ticket earnings from Available Balance & Total Earnings
  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: -vendorReversalAmount,
    totalEarningsInc: -vendorReversalAmount,
    pendingBalanceInc: 0,
  }, options);

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
    amount: -vendorReversalAmount,
    platformCommission: 0,
    adminCouponDiscount: 0,
    netAmount: -vendorReversalAmount,
    status: "completed",
    description,
    metadata: {
      ticketId: isPartial ? ticketId : undefined,
      isPartial: isPartial,
      vendorReversalAmount,
      originalCreditedAmount: fullVendorAmount,
    },
    createdTime: new Date(),
  }, options);

  return {
    wallet: updatedWallet,
    transaction,
    vendorReversalAmount,
    proportionalVendorRefund: vendorReversalAmount,
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
    const vendorObjId = mongoose.isValidObjectId(vendorId)
      ? new mongoose.Types.ObjectId(vendorId.toString())
      : vendorId;

    const [txStats, withdrawalStats] = await Promise.all([
      WalletTransaction.aggregate([
        {
          $match: {
            $or: [
              { walletId: wallet._id },
              { vendorId: { $in: [vendorObjId, vendorId.toString()] } },
            ],
            status: { $ne: "failed" },
          },
        },
        {
          $group: {
            _id: "$transactionType",
            totalAmount: { $sum: { $ifNull: ["$netAmount", "$amount"] } },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        {
          $match: {
            $or: [
              { walletId: wallet._id },
              { vendorId: { $in: [vendorObjId, vendorId.toString()] } },
            ],
          },
        },
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
      } else if (stat._id === "refund" || stat._id === "debit") {
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

    // Only sync/update wallet properties if there are recorded transactions/withdrawals OR if balances differ
    if (
      txStats.length > 0 ||
      withdrawalStats.length > 0 ||
      wallet.availableBalance !== availableBalance ||
      wallet.totalEarnings !== totalEarnings
    ) {
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

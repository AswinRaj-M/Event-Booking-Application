import AdminWallet from "../../models/adminWallet.model.js";
import AdminWalletTransaction from "../../models/adminWalletTransaction.model.js";
import Payment from "../../models/payment.model.js";

/**
 * Find or create AdminWallet for a given adminId
 */
export const findOrCreateAdminWalletRepo = async (adminId) => {
  let wallet = await AdminWallet.findOne({ adminId });
  if (!wallet) {
    wallet = await AdminWallet.create({
      adminId,
      balance: 0,
      totalDeposited: 0,
      totalCommissionEarned: 0,
      totalPayoutsDisbursed: 0,
      currency: "INR",
      isActive: true,
    });
  }
  return wallet;
};

/**
 * Find AdminWallet by adminId
 */
export const findAdminWalletByAdminIdRepo = async (adminId) => {
  return await AdminWallet.findOne({ adminId });
};

/**
 * Update AdminWallet balance & totals atomically
 */
export const updateAdminWalletBalanceRepo = async (
  walletId,
  { balanceInc = 0, totalDepositedInc = 0, totalCommissionInc = 0, totalPayoutsInc = 0 }
) => {
  const updateOps = {};
  if (balanceInc !== 0) updateOps.balance = balanceInc;
  if (totalDepositedInc !== 0) updateOps.totalDeposited = totalDepositedInc;
  if (totalCommissionInc !== 0) updateOps.totalCommissionEarned = totalCommissionInc;
  if (totalPayoutsInc !== 0) updateOps.totalPayoutsDisbursed = totalPayoutsInc;

  return await AdminWallet.findByIdAndUpdate(
    walletId,
    { $inc: updateOps },
    { new: true, runValidators: true }
  );
};

/**
 * Create an AdminWalletTransaction record
 */
export const createAdminWalletTransactionRepo = async (data) => {
  return await AdminWalletTransaction.create(data);
};

/**
 * Find transactions for Admin Wallet with pagination & sorting
 */
export const findAdminWalletTransactionsRepo = async (adminId, options = {}) => {
  const { page = 1, limit = 10, transactionType, type, status, startDate, endDate, search } = options;
  const filter = {};
  
  // Type filter
  const filterType = transactionType || type;
  if (filterType && filterType !== "all") {
    if (filterType.toLowerCase() === "credit") {
      filter.amount = { $gte: 0 };
    } else if (filterType.toLowerCase() === "debit") {
      filter.amount = { $lt: 0 };
    } else {
      filter.transactionType = filterType.toLowerCase();
    }
  }

  // Status filter
  if (status && status !== "all") {
    filter.status = status.toLowerCase();
  }

  // Date Range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
  }

  // Search filter
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { description: searchRegex },
      { razorpayPaymentId: searchRegex },
      { razorpayOrderId: searchRegex },
      { "metadata.bookingCode": searchRegex },
      { "metadata.ticketId": searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    AdminWalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AdminWalletTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

/**
 * Create a Payment record for admin deposit
 */
export const createDepositPaymentRepo = async (data) => {
  return await Payment.create(data);
};

/**
 * Find deposit Payment record by Razorpay orderId
 */
export const findDepositPaymentByOrderIdRepo = async (razorpayOrderId) => {
  return await Payment.findOne({
    razorpayOrderId,
    paymentType: "admin-wallet-deposit",
  });
};

/**
 * Update deposit Payment record by Razorpay orderId
 */
export const updateDepositPaymentRepo = async (
  razorpayOrderId,
  updateData
) => {
  return await Payment.findOneAndUpdate(
    { razorpayOrderId, paymentType: "admin-wallet-deposit" },
    { $set: updateData },
    { new: true }
  );
};


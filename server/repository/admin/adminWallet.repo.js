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
  const { page = 1, limit = 50, transactionType, status } = options;
  const filter = { adminId };
  if (transactionType && transactionType !== "all") {
    filter.transactionType = transactionType;
  }
  if (status && status !== "all") {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    AdminWalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AdminWalletTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
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


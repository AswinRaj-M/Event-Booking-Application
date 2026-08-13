import User from "../../models/user.model.js";
import UserWalletTransaction from "../../models/userWalletTransaction.model.js";
import Payment from "../../models/payment.model.js";

/**
 * Find user wallet details (balance) by userId
 */
export const findUserWalletRepo = async (userId) => {
  return await User.findById(userId).select("fullName email walletBalance role profilePicture");
};

/**
 * Update user wallet balance atomically
 */
export const updateUserWalletBalanceRepo = async (userId, balanceInc = 0) => {
  return await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: balanceInc } },
    { new: true, runValidators: true }
  );
};

/**
 * Create a UserWalletTransaction record
 */
export const createUserWalletTransactionRepo = async (data) => {
  return await UserWalletTransaction.create(data);
};

/**
 * Find transactions for User Wallet with pagination & sorting
 */
export const findUserWalletTransactionsRepo = async (userId, options = {}) => {
  const { page = 1, limit = 50, transactionType, status } = options;
  const filter = { userId };
  if (transactionType && transactionType !== "all") {
    filter.transactionType = transactionType;
  }
  if (status && status !== "all") {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    UserWalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    UserWalletTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
};

/**
 * Create a Payment record for user wallet deposit
 */
export const createUserDepositPaymentRepo = async (data) => {
  return await Payment.create(data);
};

/**
 * Find deposit Payment record by Razorpay orderId
 */
export const findUserDepositPaymentByOrderIdRepo = async (razorpayOrderId) => {
  return await Payment.findOne({
    razorpayOrderId,
    paymentType: "user-wallet-deposit",
  });
};

/**
 * Update user deposit Payment record by Razorpay orderId
 */
export const updateUserDepositPaymentRepo = async (
  razorpayOrderId,
  updateData
) => {
  return await Payment.findOneAndUpdate(
    { razorpayOrderId, paymentType: "user-wallet-deposit" },
    { $set: updateData },
    { new: true }
  );
};

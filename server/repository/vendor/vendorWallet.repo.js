import mongoose from "mongoose";
import Wallet from "../../models/wallet.model.js";
import WalletTransaction from "../../models/walletTransaction.model.js";

/**
 * Find vendor wallet by vendorId
 */
export const findWalletByVendorIdRepo = async (vendorId) => {
  const vendorObjId = mongoose.isValidObjectId(vendorId) ? new mongoose.Types.ObjectId(vendorId.toString()) : vendorId;
  return await Wallet.findOne({ vendorId: { $in: [vendorObjId, vendorId?.toString()] } });
};

/**
 * Create new wallet for a vendor
 */
export const createWalletRepo = async (walletData) => {
  const wallet = new Wallet(walletData);
  return await wallet.save();
};

/**
 * Find wallet by vendorId or create automatically if not existing
 */
export const findOrCreateWalletRepo = async (vendorId) => {
  const vendorObjId = mongoose.isValidObjectId(vendorId) ? new mongoose.Types.ObjectId(vendorId.toString()) : vendorId;
  let wallet = await Wallet.findOne({ vendorId: { $in: [vendorObjId, vendorId?.toString()] } });
  if (!wallet) {
    wallet = await Wallet.create({ vendorId: vendorObjId, availableBalance: 0, totalEarnings: 0, pendingBalance: 0 });
  } else if (wallet.availableBalance < 0 || wallet.totalEarnings < 0) {
    wallet.availableBalance = Math.max(0, wallet.availableBalance);
    wallet.totalEarnings = Math.max(0, wallet.totalEarnings);
    await wallet.save();
  }
  return wallet;
};

/**
 * Update wallet balances atomically and safely
 */
export const updateWalletBalanceRepo = async (walletId, { availableBalanceInc = 0, totalEarningsInc = 0, pendingBalanceInc = 0 }, options = {}) => {
  const session = options?.session;
  const wallet = session ? await Wallet.findById(walletId).session(session) : await Wallet.findById(walletId);
  if (!wallet) return null;

  wallet.availableBalance = Math.max(0, (wallet.availableBalance || 0) + availableBalanceInc);
  wallet.totalEarnings = Math.max(0, (wallet.totalEarnings || 0) + totalEarningsInc);
  wallet.pendingBalance = Math.max(0, (wallet.pendingBalance || 0) + pendingBalanceInc);

  return await wallet.save(options);
};

/**
 * Create a new wallet transaction history record
 */
export const createWalletTransactionRepo = async (transactionData, options = {}) => {
  if (options?.session) {
    const docs = await WalletTransaction.create([transactionData], options);
    return docs[0];
  }
  const transaction = new WalletTransaction(transactionData);
  return await transaction.save();
};

/**
 * Find existing transaction by bookingId (Idempotency Check)
 */
export const findTransactionByBookingIdRepo = async (bookingId) => {
  return await WalletTransaction.findOne({ bookingId });
};

/**
 * Get wallet transactions history for a vendor
 */
export const getWalletTransactionsRepo = async (vendorId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const vendorObjId = mongoose.isValidObjectId(vendorId) ? new mongoose.Types.ObjectId(vendorId.toString()) : vendorId;
  const wallet = await findWalletByVendorIdRepo(vendorId);

  const matchFilter = wallet
    ? { $or: [{ walletId: wallet._id }, { vendorId: { $in: [vendorObjId, vendorId?.toString()] } }] }
    : { vendorId: { $in: [vendorObjId, vendorId?.toString()] } };

  const transactions = await WalletTransaction.find(matchFilter)
    .populate("eventId", "title schedule thumbnail")
    .populate("bookingId", "bookingId quantity totalAmount")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await WalletTransaction.countDocuments(matchFilter);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

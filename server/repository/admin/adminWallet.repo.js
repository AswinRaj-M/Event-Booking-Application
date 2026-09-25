import AdminWallet from "../../models/adminWallet.model.js";
import AdminWalletTransaction from "../../models/adminWalletTransaction.model.js";
import Payment from "../../models/payment.model.js";
import WithdrawalRequest from "../../models/withdrawalRequest.model.js";
import Booking from "../../models/booking.model.js";
import User from "../../models/user.model.js";

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
  { balanceInc = 0, totalDepositedInc = 0, totalCommissionInc = 0, totalPayoutsInc = 0 },
  options = {}
) => {
  const updateOps = {};
  if (balanceInc !== 0) updateOps.balance = balanceInc;
  if (totalDepositedInc !== 0) updateOps.totalDeposited = totalDepositedInc;
  if (totalCommissionInc !== 0) updateOps.totalCommissionEarned = totalCommissionInc;
  if (totalPayoutsInc !== 0) updateOps.totalPayoutsDisbursed = totalPayoutsInc;

  return await AdminWallet.findByIdAndUpdate(
    walletId,
    { $inc: updateOps },
    { new: true, runValidators: true, session: options?.session }
  );
};

/**
 * Create an AdminWalletTransaction record
 */
export const createAdminWalletTransactionRepo = async (data, options = {}) => {
  if (options?.session) {
    const docs = await AdminWalletTransaction.create([data], options);
    return docs[0];
  }
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

/**
 * Fetch platform financial aggregations (Withdrawals, Ledger commission, Booking fee, Coupon subsidy)
 */
export const getPlatformFinancialKpisRepo = async () => {
  return await Promise.all([
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
    // Commission earned from AdminWalletTransaction ledger
    AdminWalletTransaction.aggregate([
      { $match: { transactionType: "commission", status: "completed" } },
      {
        $group: {
          _id: null,
          totalLedgerCommission: { $sum: "$amount" },
        },
      },
    ]),
    // Platform fee earned across paid bookings
    Booking.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: "paid" },
            { bookingStatus: { $in: ["confirmed", "completed"] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalBookingCommission: {
            $sum: {
              $cond: [
                { $gt: ["$totalPlatformFee", 0] },
                "$totalPlatformFee",
                {
                  $cond: [
                    { $gt: ["$platformFee", 0] },
                    { $multiply: ["$platformFee", { $ifNull: ["$quantity", 1] }] },
                    {
                      $cond: [
                        { $gt: ["$ticketPrice", 0] },
                        { $multiply: [50, { $ifNull: ["$quantity", 1] }] },
                        0
                      ]
                    }
                  ]
                }
              ]
            }
          },
        },
      },
    ]),
    // Coupon discounts absorbed/funded by platform across confirmed bookings
    Booking.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: "paid" },
            { bookingStatus: { $in: ["confirmed", "completed"] } }
          ],
          couponDiscount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalCouponSponsored: { $sum: "$couponDiscount" },
        },
      },
    ]),
  ]);
};

/**
 * Save an AdminWallet document
 */
export const saveAdminWalletRepo = async (wallet) => {
  return await wallet.save();
};

/**
 * Find single AdminWalletTransaction by query
 */
export const findAdminWalletTransactionRepo = async (query, session = null) => {
  if (session) {
    return await AdminWalletTransaction.findOne(query).session(session);
  }
  return await AdminWalletTransaction.findOne(query);
};

/**
 * Find multiple AdminWalletTransactions by query
 */
export const findAdminWalletTransactionsByQueryRepo = async (query, session = null) => {
  if (session) {
    return await AdminWalletTransaction.find(query).session(session);
  }
  return await AdminWalletTransaction.find(query);
};

/**
 * Find system administrator user
 */
export const findSystemAdminUserRepo = async (session = null) => {
  const query = {
    $or: [{ role: { $regex: /^admin$/i } }, { email: { $regex: /admin/i } }],
  };
  if (session) {
    return await User.findOne(query).session(session);
  }
  return await User.findOne(query);
};


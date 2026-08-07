import {
  findOrCreateWalletRepo,
  updateWalletBalanceRepo,
  createWalletTransactionRepo,
} from "../../repository/vendor/vendorWallet.repo.js";
import {
  createWithdrawalRequestRepo,
  findWithdrawalRequestByIdRepo,
  findPendingWithdrawalByVendorIdRepo,
  getVendorWithdrawalRequestsRepo,
  getAdminWithdrawalRequestsRepo,
  updateWithdrawalRequestStatusRepo,
} from "../../repository/vendor/withdrawal.repo.js";
import Vendor from "../../models/vendor.model.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * STEP 82: Vendor Request Withdrawal
 */
export const requestVendorWithdrawalService = async (vendorId, { amount, destinationAccount, bankDetails }) => {
  const reqAmount = Number(amount);
  if (isNaN(reqAmount) || reqAmount <= 0) {
    throw new AppError("Requested withdrawal amount must be greater than zero.", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Validate Vendor Exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor account not found.", HTTP_STATUS.NOT_FOUND);
  }

  // 2. Validate Wallet Exists
  const wallet = await findOrCreateWalletRepo(vendorId);
  if (!wallet) {
    throw new AppError("Vendor wallet not found.", HTTP_STATUS.NOT_FOUND);
  }

  // 3. Validate Available Balance
  if (reqAmount > wallet.availableBalance) {
    throw new AppError(
      `Requested amount ($${reqAmount.toFixed(2)}) exceeds available wallet balance ($${wallet.availableBalance.toFixed(2)}).`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 4. Prevent Duplicate Pending Requests
  const existingPending = await findPendingWithdrawalByVendorIdRepo(vendorId);
  if (existingPending) {
    throw new AppError(
      "You already have a pending withdrawal request under review. Please wait for admin approval.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 5. Create Pending Withdrawal Request (Money is NOT deducted yet)
  const withdrawalRequest = await createWithdrawalRequestRepo({
    vendorId,
    walletId: wallet._id,
    amount: reqAmount,
    destinationAccount: destinationAccount || "Bank Transfer",
    bankDetails: bankDetails || {},
    status: "pending",
    requestedAt: new Date(),
  });

  return withdrawalRequest;
};

/**
 * STEP 83: Admin Approve Withdrawal
 */
export const approveWithdrawalService = async (adminId, requestId) => {
  if (!requestId) {
    throw new AppError("Withdrawal Request ID is required.", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Find Request & Validate Pending Status (Prevents Race Conditions & Duplicate Processing)
  const request = await findWithdrawalRequestByIdRepo(requestId);
  if (!request) {
    throw new AppError("Withdrawal request not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (request.status !== "pending") {
    throw new AppError(`Withdrawal request has already been ${request.status}.`, HTTP_STATUS.BAD_REQUEST);
  }

  // 2. Validate & Deduct Wallet Available Balance & Increment Total Withdrawn
  const wallet = await findOrCreateWalletRepo(request.vendorId._id || request.vendorId);
  if (wallet.availableBalance < request.amount) {
    throw new AppError("Vendor available balance is insufficient to fulfill this withdrawal.", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
    availableBalanceInc: -request.amount,
    totalEarningsInc: 0,
    pendingBalanceInc: 0,
  });

  // Increment totalWithdrawn field on wallet
  updatedWallet.totalWithdrawn = (updatedWallet.totalWithdrawn || 0) + request.amount;
  await updatedWallet.save();

  // 3. Update Request Status to Approved
  const approvedRequest = await updateWithdrawalRequestStatusRepo(requestId, {
    status: "approved",
    processedAt: new Date(),
    processedBy: adminId,
  });

  // 4. Create WalletTransaction Record (type = "withdrawal")
  const transaction = await createWalletTransactionRepo({
    walletId: wallet._id,
    vendorId: request.vendorId._id || request.vendorId,
    withdrawalId: request._id,
    transactionType: "withdrawal",
    amount: -request.amount,
    platformCommission: 0,
    netAmount: -request.amount,
    status: "completed",
    description: `Payout withdrawal to ${request.destinationAccount || "Bank Account"}`,
    createdTime: new Date(),
  });

  return {
    withdrawal: approvedRequest,
    wallet: updatedWallet,
    transaction,
  };
};

/**
 * STEP 84: Admin Reject Withdrawal
 */
export const rejectWithdrawalService = async (adminId, requestId, rejectionReason) => {
  if (!requestId) {
    throw new AppError("Withdrawal Request ID is required.", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Find Request & Validate Pending Status
  const request = await findWithdrawalRequestByIdRepo(requestId);
  if (!request) {
    throw new AppError("Withdrawal request not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (request.status !== "pending") {
    throw new AppError(`Withdrawal request has already been ${request.status}.`, HTTP_STATUS.BAD_REQUEST);
  }

  // 2. Update Status to Rejected (Wallet balance remains unchanged, NO transaction created)
  const rejectedRequest = await updateWithdrawalRequestStatusRepo(requestId, {
    status: "rejected",
    processedAt: new Date(),
    processedBy: adminId,
    rejectionReason: rejectionReason || "Withdrawal request rejected by administrator.",
  });

  return rejectedRequest;
};

/**
 * Get Vendor Withdrawals
 */
export const getVendorWithdrawalsService = async (vendorId) => {
  return await getVendorWithdrawalRequestsRepo(vendorId);
};

/**
 * Get Admin Withdrawal Requests
 */
export const getAdminWithdrawalRequestsService = async (statusFilter) => {
  return await getAdminWithdrawalRequestsRepo(statusFilter);
};

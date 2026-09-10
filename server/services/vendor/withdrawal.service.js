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
import { sendNotification, sendAdminNotification } from "../../config/socket.js";

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

  // Send notification to Admin
  sendAdminNotification({
    title: "New Vendor Withdrawal Request 💸",
    message: `Vendor ${vendor.organizerName || vendor.businessName || 'Vendor'} requested payout of ₹${reqAmount.toFixed(2)}.`,
    type: "REFUND_REQUESTED"
  }).catch(() => {});

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

  // Handle User Withdrawal vs Vendor Withdrawal
  const isUserRequest = request.userType === "user" || Boolean(request.userId);

  if (isUserRequest) {
    const userId = request.userId?._id || request.userId;
    const { findUserWalletRepo, updateUserWalletBalanceRepo, createUserWalletTransactionRepo } = await import("../../repository/user/userWallet.repo.js");
    
    const user = await findUserWalletRepo(userId);
    if (!user || (user.walletBalance || 0) < request.amount) {
      throw new AppError("User wallet balance is insufficient to fulfill this withdrawal.", HTTP_STATUS.BAD_REQUEST);
    }

    // Deduct user wallet balance upon admin approval
    const updatedUser = await updateUserWalletBalanceRepo(userId, -request.amount);

    // Update Request Status to Approved
    const approvedRequest = await updateWithdrawalRequestStatusRepo(requestId, {
      status: "approved",
      processedAt: new Date(),
      processedBy: adminId,
    });

    // Update existing pending UserWalletTransaction to completed (or create if missing)
    const UserWalletTransaction = (await import("../../models/userWalletTransaction.model.js")).default;
    let transaction = await UserWalletTransaction.findOneAndUpdate(
      { "metadata.withdrawalRequestId": request._id, status: "pending" },
      { $set: { status: "completed", balanceAfter: updatedUser?.walletBalance || 0 } },
      { new: true }
    );

    if (!transaction) {
      transaction = await createUserWalletTransactionRepo({
        userId,
        transactionType: "withdrawal",
        amount: -request.amount,
        currency: "INR",
        balanceAfter: updatedUser?.walletBalance || 0,
        status: "completed",
        paymentMethod: request.paymentMethod || "UPI / GPay",
        description: `Withdrawal payout to ${request.destinationAccount || request.paymentMethod}`,
        metadata: {
          requestId: request._id,
          withdrawalRequestId: request._id,
          payoutMethod: request.paymentMethod,
          destinationAccount: request.destinationAccount,
        },
      });
    }

    return {
      withdrawal: approvedRequest,
      user: updatedUser,
      transaction,
    };
  } else {
    // Vendor Withdrawal Request
    const vendorId = request.vendorId?._id || request.vendorId;
    const wallet = await findOrCreateWalletRepo(vendorId);
    if (!wallet || wallet.availableBalance < request.amount) {
      throw new AppError("Vendor available balance is insufficient to fulfill this withdrawal.", HTTP_STATUS.BAD_REQUEST);
    }

    const updatedWallet = await updateWalletBalanceRepo(wallet._id, {
      availableBalanceInc: -request.amount,
      totalEarningsInc: 0,
      pendingBalanceInc: 0,
    });

    updatedWallet.totalWithdrawn = (updatedWallet.totalWithdrawn || 0) + request.amount;
    await updatedWallet.save();

    const approvedRequest = await updateWithdrawalRequestStatusRepo(requestId, {
      status: "approved",
      processedAt: new Date(),
      processedBy: adminId,
    });

    const transaction = await createWalletTransactionRepo({
      walletId: wallet._id,
      vendorId: vendorId,
      withdrawalId: request._id,
      transactionType: "withdrawal",
      amount: -request.amount,
      platformCommission: 0,
      netAmount: -request.amount,
      status: "completed",
      description: `Payout withdrawal to ${request.destinationAccount || "Bank Account"}`,
      createdTime: new Date(),
    });

    // Send notification to Vendor
    if (vendorId) {
      sendNotification(vendorId, {
        title: "Withdrawal Approved! 💰",
        message: `Your withdrawal request of ₹${request.amount.toFixed(2)} has been approved and processed.`,
        type: "REFUND_COMPLETED"
      }).catch(() => {});
    }

    return {
      withdrawal: approvedRequest,
      wallet: updatedWallet,
      transaction,
    };
  }
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

  // 2. Update Status to Rejected
  const rejectedRequest = await updateWithdrawalRequestStatusRepo(requestId, {
    status: "rejected",
    processedAt: new Date(),
    processedBy: adminId,
    rejectionReason: rejectionReason || "Withdrawal request rejected by administrator.",
  });

  // 3. Update pending UserWalletTransaction status to 'failed' if present
  if (request.userType === "user" || request.userId) {
    const UserWalletTransaction = (await import("../../models/userWalletTransaction.model.js")).default;
    await UserWalletTransaction.findOneAndUpdate(
      { "metadata.withdrawalRequestId": request._id, status: "pending" },
      { $set: { status: "failed" } }
    );
  }

  // Send notification to User/Vendor on rejection
  const targetId = (request.userType === "user" || request.userId) 
    ? (request.userId?._id || request.userId) 
    : (request.vendorId?._id || request.vendorId);
  if (targetId) {
    sendNotification(targetId, {
      title: "Withdrawal Request Rejected ❌",
      message: `Your withdrawal request of ₹${request.amount.toFixed(2)} was rejected: ${rejectionReason || "Declined by administrator."}`,
      type: "BOOKING_CANCELLED"
    }).catch(() => {});
  }

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

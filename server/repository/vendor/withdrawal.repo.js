import WithdrawalRequest from "../../models/withdrawalRequest.model.js";

/**
 * Create a new withdrawal request
 */
export const createWithdrawalRequestRepo = async (data) => {
  const request = new WithdrawalRequest(data);
  return await request.save();
};

/**
 * Find withdrawal request by ID
 */
export const findWithdrawalRequestByIdRepo = async (id) => {
  return await WithdrawalRequest.findById(id)
    .populate("vendorId", "fullName email businessName profilePicture")
    .populate("userId", "fullName email profilePicture");
};

/**
 * Find active pending withdrawal request for a vendor
 */
export const findPendingWithdrawalByVendorIdRepo = async (vendorId) => {
  return await WithdrawalRequest.findOne({ vendorId, status: "pending" });
};

/**
 * Find active pending withdrawal request for a user
 */
export const findPendingWithdrawalByUserIdRepo = async (userId) => {
  return await WithdrawalRequest.findOne({ userId, status: "pending" });
};

/**
 * Get vendor's withdrawal requests history
 */
export const getVendorWithdrawalRequestsRepo = async (vendorId) => {
  return await WithdrawalRequest.find({ vendorId }).sort({ createdAt: -1 });
};

/**
 * List all withdrawal requests for admin (optionally filtered by status)
 */
export const getAdminWithdrawalRequestsRepo = async (statusFilter) => {
  const query = statusFilter ? { status: statusFilter } : {};
  return await WithdrawalRequest.find(query)
    .populate("vendorId", "fullName email businessName profilePicture")
    .populate("userId", "fullName email profilePicture")
    .sort({ createdAt: -1 });
};

/**
 * Update withdrawal request status & details
 */
export const updateWithdrawalRequestStatusRepo = async (id, updateData) => {
  return await WithdrawalRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

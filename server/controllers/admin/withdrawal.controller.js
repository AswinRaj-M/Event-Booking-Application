import {
  approveWithdrawalService,
  rejectWithdrawalService,
  getAdminWithdrawalRequestsService,
} from "../../services/vendor/withdrawal.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * Admin Get All Withdrawal Requests
 */
export const getAdminWithdrawalRequests = async (req, res) => {
  const statusFilter = req.query.status;
  const requests = await getAdminWithdrawalRequestsService(statusFilter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    requests,
  });
};

/**
 * Admin Approve Withdrawal Request
 */
export const approveWithdrawal = async (req, res) => {
  const adminId = req.user._id;
  const { id } = req.params;

  const result = await approveWithdrawalService(adminId, id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Withdrawal request approved successfully. Vendor wallet updated.",
    ...result,
  });
};

/**
 * Admin Reject Withdrawal Request
 */
export const rejectWithdrawal = async (req, res) => {
  const adminId = req.user._id;
  const { id } = req.params;
  const { rejectionReason } = req.body;

  const result = await rejectWithdrawalService(adminId, id, rejectionReason);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Withdrawal request rejected successfully.",
    withdrawal: result,
  });
};

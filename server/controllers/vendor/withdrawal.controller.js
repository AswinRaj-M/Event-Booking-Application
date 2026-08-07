import {
  requestVendorWithdrawalService,
  getVendorWithdrawalsService,
} from "../../services/vendor/withdrawal.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * Vendor Request Withdrawal
 */
export const requestWithdrawalController = async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id;
  const { amount, destinationAccount, bankDetails } = req.body;

  const withdrawal = await requestVendorWithdrawalService(vendorId, {
    amount,
    destinationAccount,
    bankDetails,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Withdrawal request submitted successfully and is pending admin review.",
    withdrawal,
  });
};

/**
 * Get Vendor Withdrawal Requests History
 */
export const getVendorWithdrawalsController = async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id;
  const withdrawals = await getVendorWithdrawalsService(vendorId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    withdrawals,
  });
};

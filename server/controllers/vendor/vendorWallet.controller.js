import {
  getVendorWalletService,
  getVendorTransactionsService,
} from "../../services/vendor/vendorWallet.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * Get Vendor Wallet Balance and Stats
 */
export const getVendorWallet = async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id;
  const wallet = await getVendorWalletService(vendorId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    wallet,
  });
};

/**
 * Get Vendor Wallet Transaction History
 */
export const getVendorTransactions = async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await getVendorTransactionsService(vendorId, { page, limit });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};

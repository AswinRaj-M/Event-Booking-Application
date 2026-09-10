import {
  getPlatformFeeService,
  updatePlatformFeeService,
} from "../../services/admin/platformSetting.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const getPlatformSetting = async (req, res) => {
  const setting = await getPlatformFeeService();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: setting,
  });
};

export const updatePlatformSetting = async (req, res) => {
  const adminId = req.user?.id || req.user?._id;
  const { platformFeePerTicket } = req.body;

  const setting = await updatePlatformFeeService(adminId, platformFeePerTicket);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Platform fee updated to ₹${setting.platformFeePerTicket.toFixed(2)} per ticket successfully.`,
    data: setting,
  });
};

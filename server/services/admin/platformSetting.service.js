import {
  getPlatformSettingRepo,
  updatePlatformSettingRepo,
} from "../../repository/admin/platformSetting.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const getPlatformFeeService = async () => {
  const setting = await getPlatformSettingRepo();
  return {
    platformFeePerTicket: setting.platformFeePerTicket,
    updatedAt: setting.updatedAt,
  };
};

export const updatePlatformFeeService = async (adminId, feePerTicket) => {
  const fee = Number(feePerTicket);
  if (isNaN(fee) || !isFinite(fee) || fee < 0) {
    throw new AppError("Platform fee per ticket must be a valid non-negative number.", HTTP_STATUS.BAD_REQUEST);
  }

  const formattedFee = Number(fee.toFixed(2));
  const setting = await updatePlatformSettingRepo(formattedFee, adminId);

  return {
    platformFeePerTicket: setting.platformFeePerTicket,
    updatedAt: setting.updatedAt,
  };
};

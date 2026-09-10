import PlatformSetting from "../../models/platformSetting.model.js";

export const getPlatformSettingRepo = async () => {
  let setting = await PlatformSetting.findOne();
  if (!setting) {
    setting = await PlatformSetting.create({ platformFeePerTicket: 50 });
  }
  return setting;
};

export const updatePlatformSettingRepo = async (feePerTicket, adminId) => {
  let setting = await PlatformSetting.findOne();
  if (!setting) {
    setting = await PlatformSetting.create({
      platformFeePerTicket: feePerTicket,
      updatedBy: adminId,
    });
  } else {
    setting.platformFeePerTicket = feePerTicket;
    setting.updatedBy = adminId;
    await setting.save();
  }
  return setting;
};

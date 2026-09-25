import Vendor from "../../models/vendor.model.js";
import Otp from "../../models/user.otp.model.js";

export const createVendor = async (data) => {
  return await Vendor.create(data);
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
};

export const findVendorById = async (vendorId) => {
  return await Vendor.findById(vendorId);
};

export const findVendorByRefreshToken = async (token) => {
  return await Vendor.findOne({ refreshToken: token });
};

export const clearVendorRefreshToken = async (token) => {
  return await Vendor.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
};

export const upsertVendorOtp = async (vendorId, otp, extraData = {}) => {
  return await Otp.findOneAndUpdate(
    { userId: vendorId },
    { otp, createdAt: new Date(), ...extraData },
    { upsert: true, new: true }
  );
};

export const findVendorOtp = async (vendorId) => {
  return await Otp.findOne({ userId: vendorId });
};

export const deleteVendorOtp = async (vendorId) => {
  return await Otp.deleteOne({ userId: vendorId });
};

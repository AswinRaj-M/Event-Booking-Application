import Vendor from "../models/vendor.model.js";

export const createVendor = async (data) => {
  return await Vendor.create(data);
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
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
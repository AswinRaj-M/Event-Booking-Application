import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";

export const findAdminByEmail = async (email) => {
  return await User.findOne({ email });
};

export const saveAdmin = async (admin) => {
  return await admin.save();
};

export const clearAdminRefreshToken = async (token) => {
  return await User.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
};

export const findAllVendors = async (filter) => {
  return await Vendor.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });
};

export const findVendorById = async (id) => {
  return await Vendor.findById(id).select("-password");
};

export const findVendorByIdFull = async (id) => {
  return await Vendor.findById(id);
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
};
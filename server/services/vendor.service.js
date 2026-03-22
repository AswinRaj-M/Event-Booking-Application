import Vendor from "../models/vendor.model.js"

export const createVendor = async (vendorData) => {
  return await Vendor.create(vendorData);
};

export const findVendorByEmail = async (email) => {
  return await Vendor.findOne({ businessEmail: email });
};

export const findVendorById = async (id) => {
  return await Vendor.findById(id);
};

export const findVendorByIdWithSelection = async (id, selection = "-password") => {
  return await Vendor.findById(id).select(selection);
};

export const updateVendorData = async (id, updateData) => {
  return await Vendor.findByIdAndUpdate(id, updateData, { new: true });
};

export const updateVendorStatus = async (vendorId, status) => {
  return await Vendor.findByIdAndUpdate(vendorId, { applicationStatus: status }, { new: true });
};

export const clearVendorRefreshToken = async (hashedToken) => {
  return await Vendor.findOneAndUpdate(
    { refreshToken: hashedToken },
    { $set: { refreshToken: null } }
  );
};

export const findVendorsWithFilter = async (filter, sort = { createdAt: -1 }) => {
  return await Vendor.find(filter).select("-password").sort(sort);
};

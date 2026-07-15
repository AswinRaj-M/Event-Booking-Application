import Vendor from "../../models/vendor.model.js";

export const findAllVendors = async (filter, skip, limit) => {
  const vendors = await Vendor.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Vendor.countDocuments(filter);
  return { vendors, total };
};

export const getVendorStats = async () => {
  const [pending, approved, rejected, suspended, total] = await Promise.all([
    Vendor.countDocuments({ applicationStatus: "pending" }),
    Vendor.countDocuments({ applicationStatus: "approved", isBlocked: { $ne: true } }),
    Vendor.countDocuments({ applicationStatus: "rejected" }),
    Vendor.countDocuments({ applicationStatus: "approved", isBlocked: true }),
    Vendor.countDocuments({}),
  ]);
  return { pending, approved, rejected, suspended, total };
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

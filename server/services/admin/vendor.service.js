import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  findAllVendors,
  findVendorById,
  findVendorByIdFull,
  saveVendor,
  getVendorStats,
} from "../../repository/admin/vendor.repo.js";

export const getAllVendorsService = async (status, page, limit, search, category) => {
  let filter = {};

  if (status) {
    if (status === "approved") {
      filter.applicationStatus = "approved";
      filter.isBlocked = { $ne: true };
    } else if (status === "suspended") {
      filter.applicationStatus = "approved";
      filter.isBlocked = true;
    } else {
      filter.applicationStatus = status;
    }
  }

  if (category && category !== "all") {
    filter.eventCategory = category;
  }

  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: "i" } },
      { organizerName: { $regex: search, $options: "i" } },
      { businessEmail: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const { vendors, total } = await findAllVendors(filter, skip, limit);
  const stats = await getVendorStats();
  return {
    data: vendors,
    total,
    stats,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getVendorByIdService = async (id) => {
  const vendor = await findVendorById(id);

  if (!vendor) {
    throw new AppError("Vendor not Found", HTTP_STATUS.NOT_FOUND);
  }

  return vendor;
};

export const vendorApproveService = async (id) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
  }

  vendor.applicationStatus = "approved";
  await saveVendor(vendor);

  return vendor;
};

export const vendorRejectService = async (id, message) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
  }

  vendor.applicationStatus = "rejected";
  vendor.rejectionReason = message;

  await saveVendor(vendor);

  return vendor;
};

export const vendorSuspendService = async(id,message) => {
  const vendor = await findVendorById(id)

  if(!vendor){
    throw new AppError("Vendor not Found!")
  }
  vendor.isBlocked = true
  vendor.refreshToken = null
  
  await saveVendor(vendor)
  return vendor
}

export const vendorUnsuspendService = async(id) => {
  const vendor = await findVendorById(id)

  if(!vendor){
    throw new AppError("Vendor not Found!")
  }
  vendor.isBlocked = false
  
  await saveVendor(vendor)
  return vendor
}

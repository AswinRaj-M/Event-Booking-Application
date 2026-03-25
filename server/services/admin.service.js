import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";

import {
  findAdminByEmail,
  saveAdmin,
  clearAdminRefreshToken,
  findAllVendors,
  findVendorById,
  findVendorByIdFull,
  saveVendor,
} from "../repository/admin.repo.js";

export const adminLoginService = async (email, password, refreshToken) => {
  if (!email || !password) {
    throw new AppError("Email and Password are Required", 400);
  }

  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (admin.role !== "admin") {
    throw new AppError("Access Denied. Not An Admin", 403);
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new AppError("Invalid Password", 401);
  }

  admin.refreshToken = hashToken(refreshToken);
  await saveAdmin(admin);

  return admin;
};

export const logoutAdminService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearAdminRefreshToken(hashed);
  }
};

export const getAllVendorsService = async (status) => {
  let filter = {};

  if (status) {
    filter.applicationStatus = status;
  }

  const vendors = await findAllVendors(filter);

  return vendors;
};

export const getVendorByIdService = async (id) => {
  const vendor = await findVendorById(id);

  if (!vendor) {
    throw new AppError("Vendor not Found", 404);
  }

  return vendor;
};

export const vendorApproveService = async (id) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.applicationStatus = "approved";
  await saveVendor(vendor);

  return vendor;
};

export const vendorRejectService = async (id, message) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.applicationStatus = "rejected";
  vendor.rejectionReason = message;

  await saveVendor(vendor);

  return vendor;
};
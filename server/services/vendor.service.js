import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";

import {
  createVendor,
  saveVendor,
  clearVendorRefreshToken,
} from "../repository/vendor.repo.js";

export const applyVendorService = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const vendor = await createVendor({
    organizerName: data.organizerName,
    businessName: data.businessName,
    businessEmail: data.businessEmail,
    password: hashedPassword,
    contactPhone: data.contactPhone,
    eventCategory: data.eventCategory,
    experience: data.experience,
    description: data.description,
    websiteOrInstagram: data.websiteOrInstagram,
    agreeTermsAndConditions: data.agreeTermsAndConditions,
    location: JSON.parse(data.location),
    businessDocument: data.businessDocument,
    idProof: data.idProof,
  });

  return vendor;
};

export const vendorLoginService = async (vendor, refreshToken) => {
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.refreshToken = hashToken(refreshToken);
  await saveVendor(vendor);

  return vendor;
};

export const vendorLogoutService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearVendorRefreshToken(hashed);
  }
};
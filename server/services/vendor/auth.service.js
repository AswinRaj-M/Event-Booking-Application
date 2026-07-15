import bcrypt from "bcryptjs";
import { hashToken } from "../../utils/hashToken.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Otp from "../../models/user.otp.model.js";
import Vendor from "../../models/vendor.model.js";

import {
  createVendor,
  saveVendor,
  clearVendorRefreshToken,
} from "../../repository/vendor/auth.repo.js";

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
    emailVerify: false,
  });

  return vendor;
};

export const createVendorOtpService = async (vendorId, otp, extraData = {}) => {
  return await Otp.findOneAndUpdate(
    { userId: vendorId },
    { otp, createdAt: new Date(), ...extraData },
    { upsert: true, new: true }
  );
};

export const verifyVendorOtpService = async (vendorId, otp) => {
  if (!vendorId || !otp) {
    throw new AppError("OTP Required", HTTP_STATUS.BAD_REQUEST);
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
  }

  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (otpDoc.otp !== otp) {
    throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
  }

  vendor.emailVerify = true;
  await vendor.save();

  await Otp.deleteOne({ userId: vendorId });

  return vendor;
};

export const vendorLoginService = async (vendor, refreshToken) => {
  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
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

import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Otp from "../../models/user.otp.model.js";
import Vendor from "../../models/vendor.model.js";

import { createVendorOtpService } from "./auth.service.js";
import { findVendorByIdAndUpdate } from "../../repository/vendor/profile.repo.js";

export const updateVendorImagesService = async(vendorId,updateData) =>{
    const vendor = await findVendorByIdAndUpdate(
      vendorId,updateData
    )

    return vendor
}

export const updateVendorProfileService = async (vendorId, profileData) => {
  return await findVendorByIdAndUpdate(vendorId, profileData);
};

export const sendVendorEmailUpdateOtpService = async (vendorId, newEmail, otp) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);

  const existingVendor = await Vendor.findOne({ businessEmail: newEmail });
  if (existingVendor && existingVendor._id.toString() !== vendorId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  await createVendorOtpService(vendorId, otp, { tempEmail: newEmail });

  return vendor;
};

export const verifyVendorEmailUpdateOtpService = async (vendorId, otp, profileData) => {
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

  if (!otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  const existingVendor = await Vendor.findOne({ businessEmail: otpDoc.tempEmail });
  if (existingVendor && existingVendor._id.toString() !== vendorId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  vendor.businessEmail = otpDoc.tempEmail;
  if (profileData.organizerName) vendor.organizerName = profileData.organizerName;
  if (profileData.eventCategory) vendor.eventCategory = profileData.eventCategory;
  if (profileData.experience) vendor.experience = profileData.experience;
  if (profileData.description) vendor.description = profileData.description;
  if (profileData.websiteOrInstagram) vendor.websiteOrInstagram = profileData.websiteOrInstagram;
  if (profileData.contactPhone) vendor.contactPhone = profileData.contactPhone;

  await vendor.save();
  await Otp.deleteOne({ userId: vendorId });

  return vendor;
};

export const resendVendorEmailUpdateOtpService = async (vendorId, otp) => {
  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc || !otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  await createVendorOtpService(vendorId, otp, { tempEmail: otpDoc.tempEmail });

  return otpDoc.tempEmail;
};

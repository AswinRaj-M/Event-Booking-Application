import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";

import {
  createVendor,
  saveVendor,
  clearVendorRefreshToken,
  findVendorByIdAndUpdate,
  addVendorPortfolioPicture,
  removeVendorImage,
  removeVendorPortfolioPicture,
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

export const updateVendorImagesService = async(vendorId,updateData) =>{
    const vendor = await findVendorByIdAndUpdate(
      vendorId,updateData
    )

    return vendor
}

export const vendorLogoutService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearVendorRefreshToken(hashed);
  }
};

export const addVendorPortfolioService = async (vendorId, fileData) => {
  const vendor = await addVendorPortfolioPicture(vendorId, fileData);
  return vendor;
};

export const removeVendorImageService = async (vendorId, imageField) => {
  return await removeVendorImage(vendorId, imageField);
};

export const removeVendorPortfolioService = async (vendorId, pictureId) => {
  return await removeVendorPortfolioPicture(vendorId, pictureId);
};

export const updateVendorProfileService = async (vendorId, profileData) => {
  return await findVendorByIdAndUpdate(vendorId, profileData);
};
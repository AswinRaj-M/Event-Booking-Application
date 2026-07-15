import {
  addVendorPortfolioPicture,
  removeVendorImage,
  removeVendorPortfolioPicture,
} from "../../repository/vendor/portfolio.repo.js";

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

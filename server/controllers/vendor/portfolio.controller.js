import { AppError } from "../../utils/AppError.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  addVendorPortfolioService,
  removeVendorImageService,
  removeVendorPortfolioService,
} from "../../services/vendor/portfolio.service.js";

export const addVendorPortfolio = async (req, res) => {
  const vendorId = req.user._id;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (!req.file) {
    throw new AppError("Portfolio picture is required", HTTP_STATUS.BAD_REQUEST);
  }

  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    "vendor/portfolios"
  );

  const fileData = {
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    fileType: uploadResult.resource_type,
  };

  const vendor = await addVendorPortfolioService(vendorId, fileData);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Portfolio picture added successfully",
    vendor,
  });
};

export const deleteVendorImage = async (req, res) => {
  const vendorId = req.user._id;
  const { imageType } = req.params;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (imageType !== "profilePicture" && imageType !== "coverImage") {
    throw new AppError("Invalid image type", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedVendor = await removeVendorImageService(vendorId, imageType);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${imageType === "profilePicture" ? "Profile picture" : "Cover image"} removed successfully`,
    vendor: updatedVendor,
  });
};

export const deleteVendorPortfolio = async (req, res) => {
  const vendorId = req.user._id;
  const { portfolioId } = req.params;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (!portfolioId) {
    throw new AppError("Portfolio ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedVendor = await removeVendorPortfolioService(vendorId, portfolioId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Portfolio picture removed successfully",
    vendor: updatedVendor,
  });
};

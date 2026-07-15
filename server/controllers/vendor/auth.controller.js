import { AppError } from "../../utils/AppError.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import { generateOTP } from "../../utils/generateOtp.js";
import { sendOTP } from "../../utils/sendMail.js";
import Vendor from "../../models/vendor.model.js";

import {
  applyVendorService,
  createVendorOtpService,
  verifyVendorOtpService,
  vendorLoginService,
  vendorLogoutService,
} from "../../services/vendor/auth.service.js";

export const applyVendor = async (req, res) => {
  if (!req.files?.businessDocument || !req.files?.idProof) {
    throw new AppError(
      "business document and ID Proof are required",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const businessDocUpload = await uploadToCloudinary(
    req.files.businessDocument[0].buffer,
    "vendorApplication/businessDocs"
  );

  const uploadIdProof = await uploadToCloudinary(
    req.files.idProof[0].buffer,
    "vendorApplication/idProofs"
  );

  const vendor = await applyVendorService({
    ...req.body,
    businessDocument: {
      fileUrl: businessDocUpload.secure_url,
      publicId: businessDocUpload.public_id,
      fileType: businessDocUpload.resource_type,
    },
    idProof: {
      fileUrl: uploadIdProof.secure_url,
      publicId: uploadIdProof.public_id,
      fileType: uploadIdProof.resource_type,
    },
  });

  const otp = generateOTP();
  await createVendorOtpService(vendor._id, otp);

  try {
    await sendOTP(vendor.businessEmail, otp);
  } catch (mailError) {
    console.error("Failed to send OTP to vendor:", mailError);
    throw new AppError(
      "vendor application submitted but failed to send verification email. Please try to verify or resend OTP.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  console.log("Vendor registered. OTP is: ", otp);
  console.log("OTP sent to vendor:", vendor.businessEmail);

  res.status(HTTP_STATUS.CREATED).json({
    message: "Otp Send To Email",
    vendorId: vendor._id,
    email: vendor.businessEmail,
  });
};

export const verifyVendorOTP = async (req, res) => {
  const { vendorId, otp } = req.body;

  const vendor = await verifyVendorOtpService(vendorId, otp);

  const accessToken = generateAccessToken(vendor);
  const refreshToken = generateRefreshToken(vendor);

  await vendorLoginService(vendor, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(HTTP_STATUS.OK).json({
    message: "Vendor email verified successfully",
    vendor: {
      id: vendor._id,
      organizerName: vendor.organizerName,
      businessEmail: vendor.businessEmail,
      businessName: vendor.businessName,
      role: vendor.role,
      applicationStatus: vendor.applicationStatus,
    },
  });
};

export const resendVendorOtp = async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);

  if (vendor.emailVerify) throw new AppError("Vendor already verified", HTTP_STATUS.BAD_REQUEST);

  const otp = generateOTP();
  await createVendorOtpService(vendor._id, otp);

  try {
    await sendOTP(vendor.businessEmail, otp);
  } catch (error) {
    console.error("Error resending vendor OTP: ", error);
    throw new AppError("Failed to resend OTP, please try again later", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Resend vendor OTP: ", otp);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Otp resend Successfully",
  });
};


export const vendorLogin = async (req, res) => {
  const vendor = req.vendor;

  if (!vendor.emailVerify) {
    const otp = generateOTP();
    await createVendorOtpService(vendor._id, otp);
    try {
      await sendOTP(vendor.businessEmail, otp);
    } catch (error) {
      console.error("Error from login otp send: ", error);
      throw new AppError("Failed to send OTP, please try again later", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    console.log("Login OTP is: ", otp);
    return res.status(HTTP_STATUS.OK).json({
      unverified: true,
      message: "Email not verified. OTP sent to your email.",
      vendorId: vendor._id,
      email: vendor.businessEmail,
    });
  }

  const accessToken = generateAccessToken(vendor);
  const refreshToken = generateRefreshToken(vendor);

  await vendorLoginService(vendor, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(HTTP_STATUS.OK).json({
    vendor: {
      id: vendor._id,
      organizerName: vendor.organizerName,
      businessEmail: vendor.businessEmail,
      businessName: vendor.businessName,
      role: vendor.role,
      applicationStatus: vendor.applicationStatus,
    },
  });
};

export const vendorLogout = async (req, res) => {
  const token = req.cookies.refreshToken;


  await vendorLogoutService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(HTTP_STATUS.OK).json({
    message: "Logged out Successfully",
  });
};

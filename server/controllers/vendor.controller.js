import { AppError } from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  applyVendorService,
  vendorLoginService,
  vendorLogoutService,
} from "../services/vendor.service.js";





export const applyVendor = async (req, res) => {
  if (!req.files?.businessDocument || !req.files?.idProof) {
    throw new AppError(
      "business document and ID Proof are required",
      400
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

  res.status(201).json({
    message: "vendor application submited successfully",
    data: {
      _id: vendor._id,
      name: vendor.organizerName,
      email: vendor.businessEmail,
      status: vendor.applicationStatus,
    },
  });
};

/**
 * VENDOR LOGIN
 */
export const vendorLogin = async (req, res) => {
  const vendor = req.vendor; 

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

  res.status(200).json({
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

/**
 * VENDOR LOGOUT
 */
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

  return res.status(200).json({
    message: "Logged out Successfully",
  });
};
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { AppError } from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  applyVendorService,
  vendorLoginService,
  vendorLogoutService,
} from "../services/vendor.service.js";

/**
 * CLOUDINARY UPLOAD (UNCHANGED)
 */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * APPLY VENDOR
 */
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
  const vendor = req.vendor; // comes from your middleware (unchanged)

  const accessToken = generateAccessToken(vendor);
  const refreshToken = generateRefreshToken(vendor);

  await vendorLoginService(vendor, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    accessToken,
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
    sameSite: "strict",
    secure: false,
  });

  return res.status(200).json({
    message: "Logged out Successfully",
  });
};
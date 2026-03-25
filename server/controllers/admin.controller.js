import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { sendMail } from "../utils/sendMail.js";
import {
  adminLoginService,
  logoutAdminService,
  getAllVendorsService,
  getVendorByIdService,
  vendorApproveService,
  vendorRejectService,
} from "../services/admin.service.js";

/**
 * ADMIN LOGIN
 */
export const AdminLogin = async (req, res) => {
  const { email, password } = req.body;

  const accessToken = generateAccessToken(email, "admin");
  const refreshToken = generateRefreshToken(email, "admin");

  const admin = await adminLoginService(email, password, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Admin Logged In Successfully",
    accessToken,
    admin: {
      id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
};

/**
 * ADMIN LOGOUT
 */
export const logoutAdmin = async (req, res) => {
  const token = req.cookies.refreshToken;

  await logoutAdminService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  return res.status(200).json({
    message: "Admin Logged Out Successfully",
  });
};

/**
 * GET ALL VENDORS
 */
export const getAllVendors = async (req, res) => {
  const { status } = req.query;

  const vendors = await getAllVendorsService(status);

  return res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors,
  });
};

/**
 * GET VENDOR BY ID
 */
export const getVendorById = async (req, res) => {
  const id = req.params.id;

  const vendor = await getVendorByIdService(id);

  return res.status(200).json({
    success: true,
    data: vendor,
  });
};

/**
 * APPROVE VENDOR
 */
export const vendorApprove = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorApproveService(id);

  sendMail(
    vendor.businessEmail,
    message,
    "Vendor Application Approved!"
  );

  return res.status(200).json({
    message: "Application Approved",
  });
};

/**
 * REJECT VENDOR
 */
export const vendorReject = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorRejectService(id, message);

  await sendMail(
    vendor.businessEmail,
    message,
    "Vendor Application rejected!"
  );

  return res.status(200).json({
    message: "Application Rejected!",
  });
};
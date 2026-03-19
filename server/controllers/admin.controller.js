import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import * as adminService from "../services/admin.service.js";

export const AdminLogin = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new AppError("Email and Password are Required", 400)
  }

  const admin = await adminService.adminLogin(email, password)

  const accessToken = generateAccessToken(admin._id, admin.role)
  const refreshToken = generateRefreshToken(admin._id)
  admin.refreshToken = hashToken(refreshToken)
  await admin.save()

  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  })

  res.cookie("adminRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  res.status(200).json({
    message: "Admin Logged In Successfully",
    admin: {
      id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role
    }
  })
}

export const logoutAdmin = async (req, res) => {
  const token = req.cookies.adminRefreshToken
  await adminService.logoutAdmin(token)

  res.clearCookie("adminAccessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  res.clearCookie("adminRefreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  return res.status(200).json({ message: "Admin Logged Out Successfully" })
}

export const getAdminMe = async (req, res) => {
  const admin = req.user;
  if (!admin || admin.role !== "admin") {
    return res.status(401).json({ message: "Not Authorized as Admin" });
  }

  return res.status(200).json({
    admin: {
      id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role
    }
  });
}

export const getAllVendors = async (req, res) => {
  const { status } = req.query
  const vendors = await adminService.getAllVendors(status)

  return res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  })
}

export const getVendorById = async (req, res) => {
  const id = req.params.id
  const vendor = await adminService.getVendorById(id)

  return res.status(200).json({
    success: true,
    data: vendor
  })
}

export const vendorApprove = async (req, res) => {
  const { id, message } = req.body
  await adminService.vendorApprove(id, message)
  return res.status(200).json({ message: "Application Approved" })
}

export const vendorReject = async (req, res) => {
  const { id, message } = req.body
  await adminService.vendorReject(id, message)
  return res.status(200).json({ message: 'Application Rejected!' })
}
import bcrypt from "bcryptjs";
import * as userService from "../services/user.service.js";
import * as vendorService from "../services/vendor.service.js";
import * as adminService from "../services/admin.service.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";

export const AdminLogin = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new AppError("Email and Password are Required", 400)
  }

  const admin = await userService.findUserByEmail(email)
  if (!admin) {
    throw new AppError("Invalid Credentials", 401)
  }

  if (admin.role !== "admin") {
    throw new AppError("Access Denied. Not An Admin", 403)
  }

  const isMatch = await bcrypt.compare(password, admin.password)

  if (!isMatch) {
    throw new AppError("Invalid Password", 401)
  }

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

  if (token) {
    const hashed = hashToken(token)
    await userService.clearUserRefreshToken(hashed)
  }

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
    return res.status(200).json({ admin: null });
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

  let filter = {}

  if (status) {
    filter.applicationStatus = status
  }

  const vendors = await vendorService.findVendorsWithFilter(filter)


  return res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  })
}


export const getVendorById = async (req, res) => {
  const id = req.params.id
  const vendor = await vendorService.findVendorByIdWithSelection(id)

  if (!vendor) {
    throw new AppError("Vendor not Found", 404)
  }

  return res.status(200).json({
    success: true,
    data: vendor
  })
}


export const vendorApprove = async (req, res) => {
  const { id, message } = req.body
  await adminService.approveVendorApplication(id, message)
  return res.status(200).json({ message: "Application Approved" })
}

export const vendorReject = async (req, res) => {
  const { id, message } = req.body
  await adminService.rejectVendorApplication(id, message)
  return res.status(200).json({ message: 'Application Rejected!' })
}
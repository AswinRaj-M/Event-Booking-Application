import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { hashToken } from "../utils/hashToken.js";
import { sendMail } from "../utils/sendMail.js";

export const adminLogin = async (email, password) => {
  const admin = await User.findOne({ email })
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

  return admin
}

export const logoutAdmin = async (token) => {
  if (token) {
    const hashed = hashToken(token)
    await User.findOneAndUpdate(
      { refreshToken: hashed },
      { $set: { refreshToken: null } }
    )
  }
}

export const getAllVendors = async (status) => {
  let filter = {}
  if (status) {
    filter.applicationStatus = status
  }

  return await Vendor.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
}

export const getVendorById = async (id) => {
  const vendor = await Vendor.findById(id).select("-password")
  if (!vendor) {
    throw new AppError("Vendor not Found", 404)
  }
  return vendor
}

export const vendorApprove = async (id, message) => {
  const vendor = await Vendor.findById(id)
  if (!vendor) {
    throw new AppError("Vendor not found", 404)
  }
  vendor.applicationStatus = "approved"
  await vendor.save()
  await sendMail(vendor.businessEmail, message, "Vendor Application Approved!")
}

export const vendorReject = async (id, message) => {
  const vendor = await Vendor.findById(id)
  if (!vendor) {
    throw new AppError("Vendor not found", 404)
  }
  vendor.applicationStatus = 'rejected'
  vendor.rejectionReason = message
  await vendor.save()
  await sendMail(vendor.businessEmail, message, 'Vendor Application rejected!')
}

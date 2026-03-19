import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"
import { hashToken } from "../utils/hashToken.js"
import * as vendorService from "../services/vendor.service.js"

export const applyVendor = async (req, res) => {
  const vendor = await vendorService.applyVendor(req.body, req.files)

  res.status(201).json({
    message: "vendor application submited successfully",
    data: {
      _id: vendor._id,
      name: vendor.organizerName,
      email: vendor.businessEmail,
      status: vendor.applicationStatus
    }
  })
}

export const vendorLogin = async(req,res) =>{
  const vendor = req.vendor

  const accessToken = generateAccessToken(vendor._id, vendor.role)
  const refreshToken = generateRefreshToken(vendor._id)

  vendor.refreshToken = hashToken(refreshToken)
  await vendor.save()

  res.cookie("vendorAccessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000
  })

  res.cookie("vendorRefreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.status(200).json({
    vendor : {
      id : vendor._id,
      organizerName : vendor.organizerName,
      businessEmail : vendor.businessEmail,
      businessName : vendor.businessName,
      role : vendor.role,
      applicationStatus : vendor.applicationStatus
    }
  })
}

export const vendorLogout = async(req,res) =>{
  const token = req.cookies.vendorRefreshToken
  await vendorService.vendorLogout(token)

  res.clearCookie("vendorAccessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  res.clearCookie("vendorRefreshToken",{
    httpOnly : true,
    sameSite : "strict",
    secure : process.env.NODE_ENV === "production"
  })

  return res.status(200).json({message : "Logged out Successfully"})
}

export const getVendorMe = async (req, res) => {
  const vendor = req.user;
  if (!vendor || vendor.role !== "vendor") {
    return res.status(401).json({ message: "Not Authorized as Vendor" });
  }

  return res.status(200).json({
    vendor : {
      id : vendor._id,
      organizerName : vendor.organizerName,
      businessEmail : vendor.businessEmail,
      businessName : vendor.businessName,
      role : vendor.role,
      applicationStatus : vendor.applicationStatus
    }
  })
}

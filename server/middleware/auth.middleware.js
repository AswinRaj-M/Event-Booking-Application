import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Vendor from '../models/vendor.model.js'
import mongoose from 'mongoose'

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not Authorized. No Token"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid Token Payload" })
    }

    let user;
    if (decoded.role === "vendor") {
      user = await Vendor.findById(userId).select("-password")
    } else {
      user = await User.findById(userId).select("-password")
    }

    if (!user) {
      return res.status(401).json({
        message: "User not Found"
      })
    }

    req.user = user

    next()
  } catch (error) {
    console.error("Error from the Protect middleware : ", error)

    return res.status(401).json({
      message: 'Invalid Token'
    })
  }
}

export const protectAdmin = async (req, res, next) => {
  try {
    let token = req.cookies.adminAccessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not Authorized. No Admin Token"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    const admin = await User.findById(userId).select("-password")
    if (!admin || admin.role !== "admin") {
      return res.status(401).json({
        message: "Admin not Found"
      })
    }

    req.user = admin
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid Admin Token'
    })
  }
}

export const protectVendor = async (req, res, next) => {
  try {
    let token = req.cookies.vendorAccessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not Authorized. No Vendor Token"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    const vendor = await Vendor.findById(userId).select("-password")
    if (!vendor || vendor.role !== "vendor") {
      return res.status(401).json({
        message: "Vendor not Found"
      })
    }

    req.user = vendor
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid Vendor Token'
    })
  }
}
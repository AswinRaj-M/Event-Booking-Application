import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Vendor from '../models/vendor.model.js'
import mongoose from 'mongoose'

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.adminAccessToken || req.cookies.vendorAccessToken || req.cookies.accessToken;

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

export const optionalProtect = async (req, res, next) => {
  try {
    let token = req.cookies.adminAccessToken || req.cookies.vendorAccessToken || req.cookies.accessToken;

    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    if (!mongoose.isValidObjectId(userId)) {
      return next()
    }

    let user;
    if (decoded.role === "vendor") {
      user = await Vendor.findById(userId).select("-password")
    } else {
      user = await User.findById(userId).select("-password")
    }

    if (user) {
      req.user = user
    }

    next()
  } catch (error) {
    // If there was a token but it's expired/invalid, we still want to return 401
    // so the frontend interceptor can attempt a token refresh.
    return res.status(401).json({
      message: 'Invalid or Expired Token'
    })
  }
}
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Vendor from '../models/vendor.model.js'
import mongoose from 'mongoose'

export const protect = (allowedRoles = ['user']) => async (req, res, next) => {
  try {
    let token = null;

    // Determine which token to use based on allowed roles
    if (allowedRoles.includes('admin') && req.cookies.adminAccessToken) {
      token = req.cookies.adminAccessToken;
    } else if (allowedRoles.includes('vendor') && req.cookies.vendorAccessToken) {
      token = req.cookies.vendorAccessToken;
    } else if (allowedRoles.includes('user') && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        message: "Not Authorized. No Token"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid Token Payload" });
    }

    // Double check the token's role matches one of the allowed roles
    if (!allowedRoles.includes(decoded.role)) {
       return res.status(403).json({ message: "Access Denied. Insufficient Role." });
    }

    let user;
    if (decoded.role === "vendor") {
      user = await Vendor.findById(userId).select("-password");
    } else {
      user = await User.findById(userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        message: "User not Found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error from the Protect middleware : ", error);

    return res.status(401).json({
      message: 'Invalid Token'
    });
  }
};

export const optionalProtect = (allowedRoles = ['user']) => async (req, res, next) => {
  try {
    let token = null;

    if (allowedRoles.includes('admin') && req.cookies.adminAccessToken) {
      token = req.cookies.adminAccessToken;
    } else if (allowedRoles.includes('vendor') && req.cookies.vendorAccessToken) {
      token = req.cookies.vendorAccessToken;
    } else if (allowedRoles.includes('user') && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    let userId = decoded.id;

    if (typeof userId === 'object' && userId.type === 'Buffer') {
      userId = Buffer.from(userId.data).toString('hex');
    }

    if (!mongoose.isValidObjectId(userId)) {
      return next();
    }

    if (!allowedRoles.includes(decoded.role)) {
       return next();
    }

    let user;
    if (decoded.role === "vendor") {
      user = await Vendor.findById(userId).select("-password");
    } else {
      user = await User.findById(userId).select("-password");
    }

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or Expired Token'
    });
  }
};
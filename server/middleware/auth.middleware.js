import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Vendor from '../models/vendor.model.js'

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        message: "Not Authorized. No Token"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    let user;
    if (decoded.role === 'vendor') {
      user = await Vendor.findById(decoded.id).select("-password")
    } else {
      user = await User.findById(decoded.id).select("-password")
    }

    if (!user) {
      return res.status(401).json({
        message: "User not Found"
      })
    }

    if (user.isBlocked) {
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

      return res.status(403).json({
        message: "Your account has been suspended by the administrator."
      });
    }

    if (decoded.role === 'user' && !user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email."
      });
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
import User from "../models/user.model.js"
import Otp from "../models/user.otp.model.js"
import Vendor from "../models/vendor.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken, generateResetToken } from "../utils/generateToken.js"
import { hashToken } from "../utils/hashToken.js"
import { AppError } from "../utils/AppError.js"
import { sendMail } from "../utils/sendMail.js"
import * as userService from "../services/user.service.js"

export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    agreeTermsAndConditions,
  } = req.body

  if (password != confirmPassword) {
    throw new AppError("Password do not match", 400)
  }
  if (!agreeTermsAndConditions || (agreeTermsAndConditions !== true && agreeTermsAndConditions !== "true")) {
    throw new AppError("You must agree to the terms and conditions", 400)
  }

  const { userId } = await userService.registerUser({
    fullName,
    email,
    phoneNumber,
    password,
    agreeTermsAndConditions
  })

  return res.status(201).json({
    message: "Otp Send To Email",
    userId
  })
}

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    throw new AppError("otp Required", 404)
  }

  const user = await userService.verifyOTP(userId, otp)

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
}

export const resendOtp = async(req,res) =>{
  const {userId} = req.body

  if(!userId)
    throw new AppError("Failed to Fetch userId",400)

  await userService.resendOtp(userId)

  return res.status(200).json({
    message : "Otp resent Successfully"
  })
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body  

  const result = await userService.loginUser(email, password)

  if (!result.isVerified) {
    return res.status(403).json({
      success: false, 
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify you email first",
      userId: result.userId
    })
  }

  const user = result.user
  const accessToken = generateAccessToken(user._id, user.role)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = hashToken(refreshToken)
  await user.save();
  
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return res.json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified : user.isVerified
    }
  })
}

export const forgotPassword = async(req,res) =>{
  const {email} = req.body
  const user = await userService.findUserByEmail(email);

  if(!user) {
    throw new AppError("User not found", 404)
  }
  const resetToken = generateResetToken(user._id,user.email)
  const resetLink = `${process.env.CLIENT_PORT}/reset-password/${resetToken}`

  await sendMail(email,`your reset password link ${resetLink}`,"reset password")

  return res.json({message : "Reset link sent to Email"})
}

export const resetPassword = async(req,res) =>{
  const {token,password} = req.body  
  let decoded;
  try {
    decoded = jwt.verify(token,process.env.JWT_RESET_SECRET)
  } catch (error) {
    throw new AppError('invalid Access token')
  }

  const user = await userService.findUserById(decoded.id)
  if(!user){
    throw new AppError("User not found",404)
  }

  const hashedPassword = await bcrypt.hash(password,10)
  user.password = hashedPassword
  await user.save() 

  return res.json({message : "Password reset Successfully"})
}

export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.adminRefreshToken || req.cookies.vendorRefreshToken || req.cookies.refreshToken

  if (!token)
    throw new AppError("No Refresh Token", 401)

  let decode;
  try {
    decode = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (error) {
    throw new AppError("Invalid Refresh Token", 403)
  }

  let userId = decode.id;
  if (typeof userId === 'object' && userId.type === 'Buffer') {
    userId = Buffer.from(userId.data).toString('hex');
  }

  let user = await userService.findUserById(userId)

  if (!user) {
    user = await userService.findVendorById(userId)
  }

  if (!user || user.refreshToken !== hashToken(token))
    throw new AppError("Invalid RefreshToken", 403)

  const newAccessToken = generateAccessToken(user._id, user.role)
  
  let cookieName = "accessToken";
  if (user.role === "admin") cookieName = "adminAccessToken";
  else if (user.role === "vendor") cookieName = "vendorAccessToken";

  res.cookie(cookieName, newAccessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, 
  });

  res.json({ message: "Token refreshed successfully" })
}

export const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;
  await userService.logoutUser(token)

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  return res.status(200).json({ message: "Logged out Successfully" })
}

export const getMe = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
}
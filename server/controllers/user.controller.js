import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateOTP } from "../utils/generateOtp.js"
import { sendOTP } from "../utils/sendMail.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"
import { hashToken } from "../utils/hashToken.js"
import Otp from "../models/user.otp.model.js"
import { AppError } from "../utils/AppError.js"
import Vendor from "../models/vendor.model.js"

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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      console.log(" Error: Email already verified", email)
      throw new AppError("Email Already Registered", 400);
    } else {
      console.log("register Info: Found unverified user, deleting to allow re-registration", email)
      await User.deleteOne({ _id: existingUser._id });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)


  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password: hashedPassword,
    agreeTermsAndConditions
  });
  const otp = generateOTP()

  await Otp.create({
    userId: user._id,
    otp
  })
    try {
      await sendOTP(email, otp)
    } catch (mailError) {
      console.error("Failed to send OTP:", mailError)
      throw new AppError("User registered but failed to send verification email. Please try to login to resend OTP.", 500)
    }

    console.log("otp is ", otp)
    console.log("OTP sent to", email)

    return res.status(201).json({
      message: "Otp Send To Email",
      userId: user._id
    })
}

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    throw new AppError("otp Required", 404)
  }

  const user = await User.findById(userId);

  if (!user)
    throw new AppError("User not found", 400);

  const otpDoc = await Otp.findOne({ userId, otp })
  if (!otpDoc) {
    throw new AppError("Invalid or Expired Otp", 400)
  }

  user.isVerified = true;

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);

  await user.save();
  await Otp.deleteOne({ userId })

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
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


export const loginUser = async (req, res) => {
  const { email, password } = req.body  

  const user = await User.findOne({ email })
  if (!user)
    throw new AppError("Invalid Credentials", 400)

  if (!user.isVerified){
    const otp = generateOTP()
    console.log("Email verify Otp : ",otp)
    await Otp.create({
      userId : user._id,
      otp
    })
    return res.status(403).json({
      success : false , 
      code : "EMAIL_NOT_VERIFIED",
      message : "Please verify you email first" ,
      userId : user._id})
  }
  const match = await bcrypt.compare(password, user.password)

  if (!match)
    throw new AppError("Password is Incorrect", 400)


  const accessToken = generateAccessToken(user._id, user.role)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = hashToken(refreshToken)
  await user.save();
  
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
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



export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken

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

  let user = await User.findById(userId)

  if (!user) {
    user = await Vendor.findById(userId)
  }

  if (!user || user.refreshToken !== hashToken(token))
    throw new AppError("Invalid RefreshToken", 403)

  const newAccessToken = generateAccessToken(user._id, user.role)

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.json({ message: "Token refreshed successfully" })
}



export const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const hashed = hashToken(token)
    await User.findOneAndUpdate(
      { refreshToken: hashed },
      { $set: { refreshToken: null } }
    )
  }

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
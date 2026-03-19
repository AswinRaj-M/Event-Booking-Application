import User from "../models/user.model.js"
import Otp from "../models/user.otp.model.js"
import Vendor from "../models/vendor.model.js"
import bcrypt from "bcryptjs"
import { generateOTP } from "../utils/generateOtp.js"
import { sendOTP } from "../utils/sendMail.js"
import { AppError } from "../utils/AppError.js"
import { hashToken } from "../utils/hashToken.js"

export const registerUser = async (userData) => {
  const { fullName, email, phoneNumber, password } = userData

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError("Email Already Registered", 400);
    } else {
      await User.deleteOne({ _id: existingUser._id });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password: hashedPassword,
    agreeTermsAndConditions: userData.agreeTermsAndConditions
  });

  const otp = generateOTP()
  await Otp.create({
    userId: user._id,
    otp
  })

  try {
    await sendOTP(email, otp)
  } catch (mailError) {
    throw new AppError("User registered but failed to send verification email. Please try to login to resend OTP.", 500)
  }

  return { userId: user._id }
}

export const verifyOTP = async (userId, otp) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 400);

  const otpDoc = await Otp.findOne({ userId, otp })
  if (!otpDoc) {
    throw new AppError("Invalid or Expired Otp", 400)
  }

  user.isVerified = true;
  await user.save();
  await Otp.deleteOne({ userId })

  return user
}

export const resendOtp = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError("User not Found", 404)

  await Otp.deleteMany({ userId })

  const otp = generateOTP()
  await Otp.create({
    userId: user._id,
    otp
  })

  try {
    await sendOTP(user.email, otp)
  } catch (error) {
    throw new AppError("Failed to resend Otp", 500)
  }

  return true
}

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) throw new AppError("Invalid Credentials", 400)

  if (!user.isVerified) {
    const otp = generateOTP()
    await Otp.create({
      userId: user._id,
      otp
    })
    await sendOTP(user.email, otp)
    return { isVerified: false, userId: user._id }
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new AppError("Password is Incorrect", 400)

  return { isVerified: true, user }
}

export const updateUserRefreshToken = async (userId, hashedToken) => {
  await User.findByIdAndUpdate(userId, { refreshToken: hashedToken })
}

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
}

export const findUserById = async (id) => {
  return await User.findById(id)
}

export const findVendorById = async (id) => {
  return await Vendor.findById(id)
}

export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    const hashed = hashToken(refreshToken)
    await User.findOneAndUpdate(
      { refreshToken: hashed },
      { $set: { refreshToken: null } }
    )
  }
}

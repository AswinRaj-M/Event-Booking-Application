import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";



import {
  findUserByEmail,
  createUser,
  deleteUserById,
  findUserById,
  updateRefreshToken,
  findByRefreshToken,

  upsertOtp,
  findOtpByUserId,
  deleteOtpByUserId,
} from "../repository/user.repo.js";



export const registerUserService = async (data) => {
  const {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    agreeTermsAndConditions,
  } = data;

  if (password !== confirmPassword) {
    throw new AppError("Password do not match", 400);
  }

  if (
    !agreeTermsAndConditions ||
    (agreeTermsAndConditions !== true &&
      agreeTermsAndConditions !== "true")
  ) {
    throw new AppError("You must agree to the terms and conditions", 400);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError("Email Already Registered", 400);
    } else {
      await deleteUserById(existingUser._id);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await createUser({
    fullName,
    email,
    phoneNumber,
    password: hashedPassword,
    agreeTermsAndConditions,
  });
};



export const createOtpService = async (userId, otp) => {
  const hashedOtp = await bcrypt.hash(otp, 10);

  return await upsertOtp(userId, hashedOtp);
};



export const verifyOtpService = async (userId, otp, refreshToken) => {
  if (!userId || !otp) {
    throw new AppError("OTP Required", 400);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 400);
  }

  const otpDoc = await findOtpByUserId(userId);
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", 400);
  }

  const isMatch = await bcrypt.compare(otp, otpDoc.otp);
  if (!isMatch) {
    throw new AppError("Invalid OTP", 400);
  }

  user.isVerified = true;
  user.refreshToken = hashToken(refreshToken);

  await user.save();
  await deleteOtpByUserId(userId);

  return user;
};



export const loginUserService = async (email, password, refreshToken) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid Credentials", 400);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email to login", 400);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError("Password is Incorrect", 400);
  }

  const hashedToken = hashToken(refreshToken);

  await updateRefreshToken(user._id, hashedToken);

  return user;
};



export const refreshAccessTokenService = async (token, decoded) => {
  const user = await findUserById(decoded.id);

  if (!user || user.refreshToken !== hashToken(token)) {
    throw new AppError("Invalid RefreshToken", 403);
  }

  return user;
};



export const logoutUserService = async (token) => {
  if (!token) return;

  const hashed = hashToken(token);

  const user = await findByRefreshToken(hashed);

  if (user) {
    await updateRefreshToken(user._id, null);
  }
};
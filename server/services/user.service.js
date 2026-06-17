import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";

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
  updatePassword,
  updateUser,
  getExploreEventsRepo,
} from "../repository/user.repo.js";
import { generateResetToken } from "../utils/generateToken.js";

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateUserProfileService = async (userId, data) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", 404);
  return await updateUser(userId, data);
};

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

export const resendOtpService = async(userId,otp)=>{
  if(!userId) throw new AppError("User id is required",400)

  const user =  await findUserById(userId)
  
  if(!user) throw new AppError("User not found",400)
  
  if(user.isVerified) throw new AppError("User already verified",400)

  await upsertOtp(user._id, otp)

  return user;
}

export const forgotPasswordService = async(email)=>{
  const user = await findUserByEmail(email)

  if(!user) throw new AppError("User not found!",400)
  
  const resetToken = generateResetToken(user)

  return {resetToken,user}
}

export const resetPasswordService = async(userId,password) =>{
  const user = await findUserById(userId)
  if(!user) throw new AppError("User not found!", 400)
  
  const hashedPassword = await bcrypt.hash(password,10)

  await updatePassword(userId,hashedPassword)
  return true
}

export const createOtpService = async (userId, otp) => {
  return await upsertOtp(userId, otp);
};

export const verifyOtpService = async (userId, otp) => {
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

  if (otp !== otpDoc.otp) {
    throw new AppError("Invalid OTP", 400);
  }

  user.isVerified = true;

  await user.save();
  await deleteOtpByUserId(userId);

  return user;
};

export const loginUserService = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid Credentials", 400);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError("Password is Incorrect", 400);
  }
  if (user.isBlocked){
    throw new AppError("You have been blocked", 401);
  }

  if (!user.isVerified) {
    return { user, unverified: true };
  }

  return { user, unverified: false };
};

export const updateRefreshTokenService = async (userId, refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  await updateRefreshToken(userId, hashedToken);
};

export const refreshAccessTokenService = async (token, decoded) => {
  let user;
  if (decoded.role === 'vendor') {
    user = await Vendor.findById(decoded.id);
  } else if (decoded.role === 'admin' || decoded.role === 'user') {
    user = await User.findById(decoded.id);
  } else {
    user = await Vendor.findById(decoded.id);
    if (!user) {
      user = await User.findById(decoded.id);
    }
  }

  if (!user || user.refreshToken !== hashToken(token)) {
    throw new AppError("Invalid RefreshToken", 403);
  }

  if (user.isBlocked) {
    throw new AppError("Your account has been suspended by the administrator.", 403);
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

export const getExploreEventsService = async () => {
  return await getExploreEventsRepo();
};
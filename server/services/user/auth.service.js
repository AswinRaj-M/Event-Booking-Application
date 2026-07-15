import bcrypt from "bcryptjs";
import { hashToken } from "../../utils/hashToken.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Vendor from "../../models/vendor.model.js";
import User from "../../models/user.model.js";
import { generateResetToken } from "../../utils/generateToken.js";

import {
  findUserByEmail,
  createUser,
  deleteUserById,
  updateRefreshToken,
  findByRefreshToken,
  upsertOtp,
  findOtpByUserId,
  deleteOtpByUserId,
} from "../../repository/user/auth.repo.js";

import {
  findUserById,
  updatePassword,
} from "../../repository/user/profile.repo.js";

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
    throw new AppError("Password do not match", HTTP_STATUS.BAD_REQUEST);
  }

  if (
    !agreeTermsAndConditions ||
    (agreeTermsAndConditions !== true &&
      agreeTermsAndConditions !== "true")
  ) {
    throw new AppError("You must agree to the terms and conditions", HTTP_STATUS.BAD_REQUEST);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError("Email Already Registered", HTTP_STATUS.BAD_REQUEST);
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
  if(!userId) throw new AppError("User id is required",HTTP_STATUS.BAD_REQUEST)

  const user =  await findUserById(userId)
  
  if(!user) throw new AppError("User not found",HTTP_STATUS.BAD_REQUEST)
  
  if(user.isVerified) throw new AppError("User already verified",HTTP_STATUS.BAD_REQUEST)

  await upsertOtp(user._id, otp)

  return user;
}

export const forgotPasswordService = async(email)=>{
  const user = await findUserByEmail(email)

  if(!user) throw new AppError("User not found!",HTTP_STATUS.BAD_REQUEST)
  
  const resetToken = generateResetToken(user)

  return {resetToken,user}
}

export const resetPasswordService = async(userId,password) =>{
  const user = await findUserById(userId)
  if(!user) throw new AppError("User not found!", HTTP_STATUS.BAD_REQUEST)
  
  const hashedPassword = await bcrypt.hash(password,10)

  await updatePassword(userId,hashedPassword)
  return true
}

export const createOtpService = async (userId, otp) => {
  return await upsertOtp(userId, otp);
};

export const verifyOtpService = async (userId, otp) => {
  if (!userId || !otp) {
    throw new AppError("OTP Required", HTTP_STATUS.BAD_REQUEST);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.BAD_REQUEST);
  }

  const otpDoc = await findOtpByUserId(userId);
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (otp !== otpDoc.otp) {
    throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
  }

  user.isVerified = true;

  await user.save();
  await deleteOtpByUserId(userId);

  return user;
};

export const loginUserService = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid Credentials", HTTP_STATUS.BAD_REQUEST);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError("Password is Incorrect", HTTP_STATUS.BAD_REQUEST);
  }
  if (user.isBlocked){
    throw new AppError("You have been blocked", HTTP_STATUS.UNAUTHORIZED);
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
    throw new AppError("Invalid RefreshToken", HTTP_STATUS.FORBIDDEN);
  }

  if (user.isBlocked) {
    throw new AppError("Your account has been suspended by the administrator.", HTTP_STATUS.FORBIDDEN);
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

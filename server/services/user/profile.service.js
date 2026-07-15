import bcrypt from "bcryptjs";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  findUserById,
  updateUser,
  updatePassword,
} from "../../repository/user/profile.repo.js";

import {
  findUserByEmail,
  upsertOtp,
  findOtpByUserId,
  deleteOtpByUserId,
} from "../../repository/user/auth.repo.js";

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return user;
};

export const updateUserProfileService = async (userId, data) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return await updateUser(userId, data);
};

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found!", HTTP_STATUS.NOT_FOUND);

  if (user.googleId && !user.password) {
    throw new AppError(
      "Accounts registered via Google OAuth cannot change passwords directly. Please use Google Login.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect current password", HTTP_STATUS.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updatePassword(userId, hashedPassword);
  return true;
};

export const sendEmailUpdateOtpService = async (userId, newEmail, otp) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);

  const existingUser = await findUserByEmail(newEmail);
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  await upsertOtp(userId, otp, { tempEmail: newEmail });

  return user;
};

export const verifyEmailUpdateOtpService = async (userId, otp, profileData) => {
  if (!userId || !otp) {
    throw new AppError("OTP Required", HTTP_STATUS.BAD_REQUEST);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const otpDoc = await findOtpByUserId(userId);
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (otp !== otpDoc.otp) {
    throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (!otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  const existingUser = await findUserByEmail(otpDoc.tempEmail);
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  user.email = otpDoc.tempEmail;
  if (profileData.fullName) user.fullName = profileData.fullName;
  if (profileData.phoneNumber) user.phoneNumber = profileData.phoneNumber;

  await user.save();
  await deleteOtpByUserId(userId);

  return user;
};

export const resendEmailUpdateOtpService = async (userId, otp) => {
  const otpDoc = await findOtpByUserId(userId);
  if (!otpDoc || !otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  await upsertOtp(userId, otp, { tempEmail: otpDoc.tempEmail });

  return otpDoc.tempEmail;
};

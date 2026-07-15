import { generateOTP } from "../../utils/generateOtp.js";
import { sendOTP } from "../../utils/sendMail.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { AppError } from "../../utils/AppError.js";

import {
  changePasswordService,
  getUserProfileService,
  updateUserProfileService,
  sendEmailUpdateOtpService,
  verifyEmailUpdateOtpService,
  resendEmailUpdateOtpService,
} from "../../services/user/profile.service.js";

export const getUserProfile = async (req, res) => {
  const userId = req.user._id;
  const user = await getUserProfileService(userId);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      walletBalance: user.walletBalance,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user._id;
  const { fullName, phoneNumber, email } = req.body;

  if (email && email !== req.user.email) {
    throw new AppError("Email change requires verification. Please use OTP verification flow.", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedUser = await updateUserProfileService(userId, { fullName, phoneNumber });
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

export const changePassword = async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Current and new password are required", HTTP_STATUS.BAD_REQUEST);
  }

  await changePasswordService(userId, currentPassword, newPassword);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Password changed successfully",
  });
};

export const sendEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;
  const { newEmail } = req.body;

  if (!newEmail) {
    throw new AppError("New email is required", HTTP_STATUS.BAD_REQUEST);
  }

  const otp = generateOTP();
  await sendEmailUpdateOtpService(userId, newEmail, otp);

  try {
    await sendOTP(newEmail, otp);
  } catch (mailError) {
    console.error("Failed to send OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Email update OTP is:", otp);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "OTP sent to new email address",
  });
};

export const verifyEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;
  const { otp, fullName, phoneNumber } = req.body;

  const updatedUser = await verifyEmailUpdateOtpService(userId, otp, { fullName, phoneNumber });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

export const resendEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;

  const otp = generateOTP();
  const tempEmail = await resendEmailUpdateOtpService(userId, otp);

  try {
    await sendOTP(tempEmail, otp);
  } catch (mailError) {
    console.error("Failed to resend OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Resent Email update OTP is:", otp);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "OTP resent to new email address",
  });
};

export const updateUserProfilePicture = async (req, res) => {
  const userId = req.user._id;
  
  if (!req.file) {
    throw new AppError("Profile picture file required", HTTP_STATUS.BAD_REQUEST);
  }
  
  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    "user/profilePictures"
  );
  
  const profilePicture = {
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    fileType: uploadResult.resource_type
  };
  
  const updatedUser = await updateUserProfileService(userId, { profilePicture });
  
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile picture updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

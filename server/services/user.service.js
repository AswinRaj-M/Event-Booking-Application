import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";

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
  findEventById,
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

export const getExploreEventsService = async (filters) => {
  return await getExploreEventsRepo(filters);
};

export const sendEmailUpdateOtpService = async (userId, newEmail, otp) => {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", 404);

  const existingUser = await findUserByEmail(newEmail);
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new AppError("Email already registered by another account", 400);
  }

  await upsertOtp(userId, otp, { tempEmail: newEmail });

  return user;
};

export const verifyEmailUpdateOtpService = async (userId, otp, profileData) => {
  if (!userId || !otp) {
    throw new AppError("OTP Required", 400);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otpDoc = await findOtpByUserId(userId);
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", 400);
  }

  if (otp !== otpDoc.otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!otpDoc.tempEmail) {
    throw new AppError("No pending email update found", 400);
  }

  const existingUser = await findUserByEmail(otpDoc.tempEmail);
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new AppError("Email already registered by another account", 400);
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
    throw new AppError("No pending email update found", 400);
  }

  await upsertOtp(userId, otp, { tempEmail: otpDoc.tempEmail });

  return otpDoc.tempEmail;
};

export const getEventByIdService = async (id) => {
  return await findEventById(id);
};

export const bookEventTicketsService = async (userId, eventId, { tierIndex, quantity, couponCode }) => {
  const event = await findEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  if (event.eventStatus === "cancelled" || event.isBlocked || event.isDeleted) {
    throw new AppError("This event is not available for booking", 400);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isFree = event.ticketType === "Free";
  let tier;
  if (isFree) {
    if (!event.ticketTiers || event.ticketTiers.length === 0) {
      event.ticketTiers = [{
        name: "General Admission",
        price: 0,
        capacity: Number(event.totalTickets) || 100,
        sold: 0,
        benefits: ["General Entry"]
      }];
    }
    tier = event.ticketTiers[0];
  } else {
    const idx = parseInt(tierIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= event.ticketTiers.length) {
      throw new AppError("Invalid ticket tier selected", 400);
    }
    tier = event.ticketTiers[idx];
  }

  const availableSeats = tier.capacity - (tier.sold || 0);
  const reqQty = parseInt(quantity, 10);
  if (isNaN(reqQty) || reqQty <= 0) {
    throw new AppError("Invalid quantity requested", 400);
  }

  const maxQty = event.maxTicketPerPerson || 5;
  if (reqQty > maxQty) {
    throw new AppError(`You can book a maximum of ${maxQty} tickets per person`, 400);
  }

  if (reqQty > availableSeats) {
    throw new AppError(`Not enough seats available. Only ${availableSeats} tickets left for this tier`, 400);
  }

  const ticketPrice = tier.price || 0;
  const subtotal = isFree ? 0 : ticketPrice * reqQty;

  let discountPercent = 0;
  if (couponCode === "WELCOME10") discountPercent = 10;
  else if (couponCode === "FESTIVE15") discountPercent = 15;
  else if (event.offer?.enabled && reqQty >= (event.offer.minTicketsRequired || 0)) {
    const now = new Date();
    let valid = true;
    if (event.offer.validFrom && new Date(event.offer.validFrom) > now) valid = false;
    if (event.offer.validUntil && new Date(event.offer.validUntil) < now) valid = false;
    if (valid) {
      discountPercent = event.offer.discountValue || 0;
    }
  }

  const discountAmount = (subtotal * discountPercent) / 100;
  const serviceFee = isFree ? 0 : 14.90;
  const totalAmount = isFree ? 0 : subtotal - discountAmount + serviceFee;

  if (!isFree && totalAmount > 0) {
    if (user.walletBalance < totalAmount) {
      throw new AppError(`Insufficient wallet balance. You need $${totalAmount.toFixed(2)} to complete this booking. Your current balance is $${user.walletBalance.toFixed(2)}.`, 400);
    }
    user.walletBalance -= totalAmount;
    await user.save();
  }

  tier.sold = (tier.sold || 0) + reqQty;
  event.markModified('ticketTiers');
  await event.save();

  const updatedEvent = await findEventById(eventId);

  return {
    event: updatedEvent,
    user
  };
};
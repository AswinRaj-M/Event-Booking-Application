import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../utils/enums/http.status.enum.js";
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
  createBookingRepo,
} from "../repository/user.repo.js";
import { generateResetToken } from "../utils/generateToken.js";

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

export const getExploreEventsService = async (filters) => {
  return await getExploreEventsRepo(filters);
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

export const getEventByIdService = async (id) => {
  return await findEventById(id);
};


export const createPendingBookingService = async (userId,eventId,tierId,quantity)=>{
   const event = await Event.findOne({_id : eventId, isDeleted : false, isBlocked : false})

   if(!event){
    throw new AppError("Event is Not Found or Currently Unavailable!",HTTP_STATUS.NOT_FOUND)
   }


   let selectedTier = null
   if(event.ticketType === "free"){
    selectedTier = event.ticketTiers?.[0] ||
     {name : "General Admmission",price : 0,capacity : event.totalTickets || 100, sold : event.soldTickets ||0}
   }
   else {
    selectedTier = event.ticketTiers.find((tier) => tier._id.toString() === tierId)
   }

   if(!selectedTier){
    throw new AppError("Selected Ticket Tier Does Not Exists!",HTTP_STATUS.BAD_REQUEST)
   }

   const availableSeats = selectedTier.capacity - (selectedTier.sold || 0)

   if(availableSeats < quantity){
    throw new AppError(`Insufficient tickets available!. Only ${availableSeats}`,HTTP_STATUS.BAD_REQUEST)
   }

   const ticketPrice = selectedTier.price || 0
   const subtotal = ticketPrice * quantity

   let discountAmount = 0

   if(event.offer?.enabled && quantity >= (event.offer.minTicketsRequired ||0)){
    const now = new Date()
    let isOfferValid = true

    if(event.offer.validFrom && new Date(event.offer.validFrom) > now) isOfferValid = false
    if(event.offer.validUntil && new Date(event.offer.validUntil < now)) isOfferValid = false

    if(isOfferValid){
      discountAmount = (subtotal * (event.offer.discountValue) || 0) / 100
    }
   }

   const serviceFee = event.ticketType === "Free" ? 0 : 14.90
   const totalAmount = subtotal - discountAmount + serviceFee

   // to generate unique bookingId
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingIdString = `BK-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const bookingPayload = {
    bookingId: bookingIdString,
    eventId,
    userId,
    tierId,
    tierName: selectedTier.name,
    ticketPrice,
    quantity,
    totalAmount,
    paymentStatus: "pending",
    bookingStatus: "pending"
  };

  return await createBookingRepo(bookingPayload)

}
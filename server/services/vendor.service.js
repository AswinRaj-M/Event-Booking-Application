import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import Otp from "../models/user.otp.model.js";
import Vendor from "../models/vendor.model.js";

import {
  createVendor,
  saveVendor,
  clearVendorRefreshToken,
  findVendorByIdAndUpdate,
  addVendorPortfolioPicture,
  removeVendorImage,
  removeVendorPortfolioPicture,
  createEventRepo,
  getVendorEventsRepo,
  cancelEventRepo,
  updateEventRepo,
  deleteEventRepo,
} from "../repository/vendor.repo.js";

export const applyVendorService = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const vendor = await createVendor({
    organizerName: data.organizerName,
    businessName: data.businessName,
    businessEmail: data.businessEmail,
    password: hashedPassword,
    contactPhone: data.contactPhone,
    eventCategory: data.eventCategory,
    experience: data.experience,
    description: data.description,
    websiteOrInstagram: data.websiteOrInstagram,
    agreeTermsAndConditions: data.agreeTermsAndConditions,
    location: JSON.parse(data.location),
    businessDocument: data.businessDocument,
    idProof: data.idProof,
    emailVerify: false,
  });

  return vendor;
};

export const createVendorOtpService = async (vendorId, otp) => {
  return await Otp.findOneAndUpdate(
    { userId: vendorId },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );
};

export const verifyVendorOtpService = async (vendorId, otp) => {
  if (!vendorId || !otp) {
    throw new AppError("OTP Required", 400);
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", 400);
  }

  if (otpDoc.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  vendor.emailVerify = true;
  await vendor.save();

  await Otp.deleteOne({ userId: vendorId });

  return vendor;
};

export const vendorLoginService = async (vendor, refreshToken) => {
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.refreshToken = hashToken(refreshToken);
  await saveVendor(vendor);

  return vendor;
};

export const updateVendorImagesService = async(vendorId,updateData) =>{
    const vendor = await findVendorByIdAndUpdate(
      vendorId,updateData
    )

    return vendor
}

export const vendorLogoutService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearVendorRefreshToken(hashed);
  }
};

export const createEventService = async(data)=>{
  const event = await createEventRepo({
    title : data.title,
    description : data.description,
    category : data.category,
    
    vendorId : data.vendorId,

    eventType : data.eventType,
    thumbnail : data.thumbnail,
    images : data.images,

    schedule : {
      date : data.date,
      startTime : data.startTime,
      endTime : data.endTime
    },

    venue : data.venue,
    address : data.address,
    city : data.city,
    state : data.state,

    location : {
      latitude : Number(data.latitude) || undefined,
      longitude : Number(data.longitude) || undefined
    },

    ageRestriction :{
      enabled : data.ageRestriction === "true" || data.ageRestriction === true,
      minAge : 18,
    },

    ticketType : data.ticketType,
    ticketTiers : data.ticketTiers,
    maxTicketPerPerson : Number(data.maxTicketPerPerson) || undefined,
    eventStatus : data.eventStatus || "pending",


    offer : {
      enabled  : data.offerEnabled === "true" || data.offerEnabled === true,
      discountValue : Number(data.discountValue) || 0 ,
      minTicketsRequired : Number(data.minTicketsRequired) || 0,
      validFrom : data.validFrom || null,
      validUntil : data.validUntil || null
    }
  })

  return event
}

export const addVendorPortfolioService = async (vendorId, fileData) => {
  const vendor = await addVendorPortfolioPicture(vendorId, fileData);
  return vendor;
};

export const removeVendorImageService = async (vendorId, imageField) => {
  return await removeVendorImage(vendorId, imageField);
};

export const removeVendorPortfolioService = async (vendorId, pictureId) => {
  return await removeVendorPortfolioPicture(vendorId, pictureId);
};

export const updateVendorProfileService = async (vendorId, profileData) => {
  return await findVendorByIdAndUpdate(vendorId, profileData);
};

export const getVendorEventsService = async (vendorId) => {
  const events =  await getVendorEventsRepo(vendorId);
  return events.map((event) =>{
    const totalTickets = event.ticketTiers.reduce(
      (sum,tier) => sum + tier.capacity,0
    )

    return {
      ...event.toObject(),
      totalTickets
    }
  })
};

export const cancelEventService = async (eventId, vendorId) => {
  return await cancelEventRepo(eventId, vendorId);
};

export const updateEventService = async (eventId, vendorId, data) => {
  const updateData = {
    title: data.title,
    description: data.description,
    category: data.category,
    eventType: data.eventType,
    
    schedule: {
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime
    },

    venue: data.venue,
    address: data.address,
    city: data.city,
    state: data.state,

    location: {
      latitude: Number(data.latitude) || undefined,
      longitude: Number(data.longitude) || undefined
    },

    ageRestriction: {
      enabled: data.ageRestriction === "true" || data.ageRestriction === true,
      minAge: 18,
    },

    ticketType: data.ticketType,
    ticketTiers: data.ticketTiers,
    maxTicketPerPerson: Number(data.maxTicketPerPerson) || undefined,
  };

  if (data.eventStatus) {
    updateData.eventStatus = data.eventStatus;
  }

  if (data.thumbnail) {
    updateData.thumbnail = data.thumbnail;
  }

  return await updateEventRepo(eventId, vendorId, updateData);
};

export const deleteEventService = async (eventId, vendorId) => {
  return await deleteEventRepo(eventId, vendorId);
};
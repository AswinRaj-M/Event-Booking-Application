import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../utils/enums/http.status.enum.js";
import Otp from "../models/user.otp.model.js";
import Vendor from "../models/vendor.model.js";
import Event from "../models/event.model.js";

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

export const createVendorOtpService = async (vendorId, otp, extraData = {}) => {
  return await Otp.findOneAndUpdate(
    { userId: vendorId },
    { otp, createdAt: new Date(), ...extraData },
    { upsert: true, new: true }
  );
};

export const verifyVendorOtpService = async (vendorId, otp) => {
  if (!vendorId || !otp) {
    throw new AppError("OTP Required", HTTP_STATUS.BAD_REQUEST);
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
  }

  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (otpDoc.otp !== otp) {
    throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
  }

  vendor.emailVerify = true;
  await vendor.save();

  await Otp.deleteOne({ userId: vendorId });

  return vendor;
};

export const vendorLoginService = async (vendor, refreshToken) => {
  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
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
  let ticketTiers = data.ticketTiers;
  if (data.ticketType === "Free") {
    ticketTiers = [{
      name: "General Admission",
      price: 0,
      capacity: Number(data.totalTickets) || 100,
      sold: 0,
      benefits: ["General Entry"]
    }];
  } else if (data.ticketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
    ticketTiers = [{
      name: "General Admission",
      price: Number(data.ticketPrice) || 0,
      capacity: Number(data.totalTickets) || 100,
      sold: 0,
      benefits: ["General Admission Entry"]
    }];
  } else if (Array.isArray(ticketTiers)) {
    ticketTiers = ticketTiers.filter(tier => {
      const hasName = tier.name && tier.name.trim() !== '';
      const hasPrice = tier.price !== undefined && tier.price !== null;
      const hasCapacity = tier.capacity !== undefined && tier.capacity !== null && tier.capacity !== 0;
      const hasBenefits = Array.isArray(tier.benefits) && tier.benefits.length > 0;
      return hasName || hasPrice || hasCapacity || hasBenefits;
    });
  }

  const event = await createEventRepo({
    title : data.title,
    description : data.description,
    category : data.category || undefined,
    
    vendorId : data.vendorId,

    eventType : data.eventType || undefined,
    onlineLink : data.onlineLink || "",
    thumbnail : data.thumbnail,
    images : data.images,

    schedule : {
      date : data.date || undefined,
      startTime : data.startTime || undefined,
      endTime : data.endTime || undefined
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
    ticketTiers : ticketTiers,
    maxTicketPerPerson : Number(data.maxTicketPerPerson) || undefined,
    eventStatus : data.eventStatus || "pending",


    offer : {
      enabled  : data.offerEnabled === "true" || data.offerEnabled === true,
      discountValue : Number(data.discountValue) || 0 ,
      minTicketsRequired : Number(data.minTicketsRequired) || 0,
      validFrom : data.validFrom || undefined,
      validUntil : data.validUntil || undefined
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
  const existingEvent = await Event.findOne({ _id: eventId, vendorId });
  let ticketTiers = data.ticketTiers;

  if (data.ticketType === "Free") {
    let soldVal = 0;
    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
      soldVal = existingEvent.ticketTiers[0].sold || 0;
    }
    ticketTiers = [{
      name: "General Admission",
      price: 0,
      capacity: Number(data.totalTickets) || 100,
      sold: soldVal,
      benefits: ["General Entry"]
    }];
  } else if (data.ticketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
    let soldVal = 0;
    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
      soldVal = existingEvent.ticketTiers[0].sold || 0;
    }
    ticketTiers = [{
      name: "General Admission",
      price: Number(data.ticketPrice) || 0,
      capacity: Number(data.totalTickets) || 100,
      sold: soldVal,
      benefits: ["General Admission Entry"]
    }];
  } else if (Array.isArray(ticketTiers)) {
    ticketTiers = ticketTiers.filter(tier => {
      const hasName = tier.name && tier.name.trim() !== '';
      const hasPrice = tier.price !== undefined && tier.price !== null;
      const hasCapacity = tier.capacity !== undefined && tier.capacity !== null && tier.capacity !== 0;
      const hasBenefits = Array.isArray(tier.benefits) && tier.benefits.length > 0;
      return hasName || hasPrice || hasCapacity || hasBenefits;
    });

    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
      ticketTiers = ticketTiers.map((tier, idx) => {
        let soldVal = 0;
        const oldTier = existingEvent.ticketTiers[idx] || existingEvent.ticketTiers.find(t => t.name === tier.name);
        if (oldTier) {
          soldVal = oldTier.sold || 0;
        }
        return {
          ...tier,
          sold: soldVal
        };
      });
    }
  }

  const updateData = {
    title: data.title,
    description: data.description,
    category: data.category || undefined,
    eventType: data.eventType || undefined,
    onlineLink: data.onlineLink,
    
    schedule: {
      date: data.date || undefined,
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined
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
    ticketTiers: ticketTiers,
    maxTicketPerPerson: Number(data.maxTicketPerPerson) || undefined,
  };

  if (data.eventStatus) {
    updateData.eventStatus = data.eventStatus;
  }

  if (data.thumbnail) {
    updateData.thumbnail = data.thumbnail;
  }

  if (data.images !== undefined) {
    updateData.images = data.images;
  }

  return await updateEventRepo(eventId, vendorId, updateData);
};

export const deleteEventService = async (eventId, vendorId) => {
  return await deleteEventRepo(eventId, vendorId);
};

export const sendVendorEmailUpdateOtpService = async (vendorId, newEmail, otp) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);

  const existingVendor = await Vendor.findOne({ businessEmail: newEmail });
  if (existingVendor && existingVendor._id.toString() !== vendorId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  await createVendorOtpService(vendorId, otp, { tempEmail: newEmail });

  return vendor;
};

export const verifyVendorEmailUpdateOtpService = async (vendorId, otp, profileData) => {
  if (!vendorId || !otp) {
    throw new AppError("OTP Required", HTTP_STATUS.BAD_REQUEST);
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);
  }

  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc) {
    throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (otpDoc.otp !== otp) {
    throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
  }

  if (!otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  const existingVendor = await Vendor.findOne({ businessEmail: otpDoc.tempEmail });
  if (existingVendor && existingVendor._id.toString() !== vendorId.toString()) {
    throw new AppError("Email already registered by another account", HTTP_STATUS.BAD_REQUEST);
  }

  vendor.businessEmail = otpDoc.tempEmail;
  if (profileData.organizerName) vendor.organizerName = profileData.organizerName;
  if (profileData.eventCategory) vendor.eventCategory = profileData.eventCategory;
  if (profileData.experience) vendor.experience = profileData.experience;
  if (profileData.description) vendor.description = profileData.description;
  if (profileData.websiteOrInstagram) vendor.websiteOrInstagram = profileData.websiteOrInstagram;
  if (profileData.contactPhone) vendor.contactPhone = profileData.contactPhone;

  await vendor.save();
  await Otp.deleteOne({ userId: vendorId });

  return vendor;
};

export const resendVendorEmailUpdateOtpService = async (vendorId, otp) => {
  const otpDoc = await Otp.findOne({ userId: vendorId });
  if (!otpDoc || !otpDoc.tempEmail) {
    throw new AppError("No pending email update found", HTTP_STATUS.BAD_REQUEST);
  }

  await createVendorOtpService(vendorId, otp, { tempEmail: otpDoc.tempEmail });

  return otpDoc.tempEmail;
};
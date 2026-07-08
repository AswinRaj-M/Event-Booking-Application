import { AppError } from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../utils/enums/http.status.enum.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  applyVendorService,
  updateVendorImagesService,
  vendorLoginService,
  vendorLogoutService,
  addVendorPortfolioService,
  removeVendorImageService,
  removeVendorPortfolioService,
  updateVendorProfileService,
  createVendorOtpService,
  verifyVendorOtpService,
  createEventService,
  getVendorEventsService,
  cancelEventService,
  updateEventService,
  deleteEventService,
  sendVendorEmailUpdateOtpService,
  verifyVendorEmailUpdateOtpService,
  resendVendorEmailUpdateOtpService,
} from "../services/vendor.service.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOTP } from "../utils/sendMail.js";
import Vendor from "../models/vendor.model.js";

export const applyVendor = async (req, res) => {
  if (!req.files?.businessDocument || !req.files?.idProof) {
    throw new AppError(
      "business document and ID Proof are required",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const businessDocUpload = await uploadToCloudinary(
    req.files.businessDocument[0].buffer,
    "vendorApplication/businessDocs"
  );

  const uploadIdProof = await uploadToCloudinary(
    req.files.idProof[0].buffer,
    "vendorApplication/idProofs"
  );

  const vendor = await applyVendorService({
    ...req.body,
    businessDocument: {
      fileUrl: businessDocUpload.secure_url,
      publicId: businessDocUpload.public_id,
      fileType: businessDocUpload.resource_type,
    },
    idProof: {
      fileUrl: uploadIdProof.secure_url,
      publicId: uploadIdProof.public_id,
      fileType: uploadIdProof.resource_type,
    },
  });

  const otp = generateOTP();
  await createVendorOtpService(vendor._id, otp);

  try {
    await sendOTP(vendor.businessEmail, otp);
  } catch (mailError) {
    console.error("Failed to send OTP to vendor:", mailError);
    throw new AppError(
      "vendor application submitted but failed to send verification email. Please try to verify or resend OTP.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  console.log("Vendor registered. OTP is: ", otp);
  console.log("OTP sent to vendor:", vendor.businessEmail);

  res.status(HTTP_STATUS.CREATED).json({
    message: "Otp Send To Email",
    vendorId: vendor._id,
    email: vendor.businessEmail,
  });
};

export const verifyVendorOTP = async (req, res) => {
  const { vendorId, otp } = req.body;

  const vendor = await verifyVendorOtpService(vendorId, otp);

  const accessToken = generateAccessToken(vendor);
  const refreshToken = generateRefreshToken(vendor);

  await vendorLoginService(vendor, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(HTTP_STATUS.OK).json({
    message: "Vendor email verified successfully",
    vendor: {
      id: vendor._id,
      organizerName: vendor.organizerName,
      businessEmail: vendor.businessEmail,
      businessName: vendor.businessName,
      role: vendor.role,
      applicationStatus: vendor.applicationStatus,
    },
  });
};

export const resendVendorOtp = async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError("Vendor not found", HTTP_STATUS.NOT_FOUND);

  if (vendor.emailVerify) throw new AppError("Vendor already verified", HTTP_STATUS.BAD_REQUEST);

  const otp = generateOTP();
  await createVendorOtpService(vendor._id, otp);

  try {
    await sendOTP(vendor.businessEmail, otp);
  } catch (error) {
    console.error("Error resending vendor OTP: ", error);
    throw new AppError("Failed to resend OTP, please try again later", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Resend vendor OTP: ", otp);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Otp resend Successfully",
  });
};


export const vendorLogin = async (req, res) => {
  const vendor = req.vendor;

  if (!vendor.emailVerify) {
    const otp = generateOTP();
    await createVendorOtpService(vendor._id, otp);
    try {
      await sendOTP(vendor.businessEmail, otp);
    } catch (error) {
      console.error("Error from login otp send: ", error);
      throw new AppError("Failed to send OTP, please try again later", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    console.log("Login OTP is: ", otp);
    return res.status(HTTP_STATUS.OK).json({
      unverified: true,
      message: "Email not verified. OTP sent to your email.",
      vendorId: vendor._id,
      email: vendor.businessEmail,
    });
  }

  const accessToken = generateAccessToken(vendor);
  const refreshToken = generateRefreshToken(vendor);

  await vendorLoginService(vendor, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(HTTP_STATUS.OK).json({
    vendor: {
      id: vendor._id,
      organizerName: vendor.organizerName,
      businessEmail: vendor.businessEmail,
      businessName: vendor.businessName,
      role: vendor.role,
      applicationStatus: vendor.applicationStatus,
    },
  });
};

export const updateVendorImages = async(req,res) =>{
  const vendorId = req.user._id
  if(!vendorId){
    throw new AppError("vendor id required")
  }
  const updateData =  {}

  if(req.files?.profilePicture?.[0]){
    const profileUpload = await uploadToCloudinary(
      req.files.profilePicture[0].buffer,
      "vendor/profilePictures"
    )

    updateData.profilePicture = {
      fileUrl :profileUpload.secure_url,
      publicId : profileUpload.public_id,
      fileType : profileUpload.resource_type
    }
  }

  if(req.files?.coverImage?.[0]){
    const coverImageUpload = await uploadToCloudinary(
      req.files.coverImage[0].buffer,
      "vendor/coverImage"
    )

    updateData.coverImage = {
      fileUrl : coverImageUpload.secure_url,
      publicId : coverImageUpload.public_id,
      fileType : coverImageUpload.resource_type
    }
  }
  const vendor = await updateVendorImagesService(vendorId,updateData)


  return res.status(HTTP_STATUS.OK).json({
    success : true,
    vendor,
    message : "Images updated Successfully "
  })

}

export const vendorProfile = (req,res) =>{
  const vendor = req.user

  if(!vendor){
    return res.status(HTTP_STATUS.NOT_FOUND).json("Vendor Not Found!")
  }
  
  return res.status(HTTP_STATUS.OK).json({
    success : true,
    vendor,
    message :"Vendor Profile get successfully"
  })
}

export const vendorLogout = async (req, res) => {
  const token = req.cookies.refreshToken;


  await vendorLogoutService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(HTTP_STATUS.OK).json({
    message: "Logged out Successfully",
  });
};

export const addVendorPortfolio = async (req, res) => {
  const vendorId = req.user._id;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (!req.file) {
    throw new AppError("Portfolio picture is required", HTTP_STATUS.BAD_REQUEST);
  }

  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    "vendor/portfolios"
  );

  const fileData = {
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    fileType: uploadResult.resource_type,
  };

  const vendor = await addVendorPortfolioService(vendorId, fileData);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Portfolio picture added successfully",
    vendor,
  });
};

export const deleteVendorImage = async (req, res) => {
  const vendorId = req.user._id;
  const { imageType } = req.params;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (imageType !== "profilePicture" && imageType !== "coverImage") {
    throw new AppError("Invalid image type", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedVendor = await removeVendorImageService(vendorId, imageType);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${imageType === "profilePicture" ? "Profile picture" : "Cover image"} removed successfully`,
    vendor: updatedVendor,
  });
};

export const deleteVendorPortfolio = async (req, res) => {
  const vendorId = req.user._id;
  const { portfolioId } = req.params;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (!portfolioId) {
    throw new AppError("Portfolio ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedVendor = await removeVendorPortfolioService(vendorId, portfolioId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Portfolio picture removed successfully",
    vendor: updatedVendor,
  });
};

export const updateVendorProfile = async (req, res) => {
  const vendorId = req.user._id;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const { organizerName, eventCategory, experience, description, websiteOrInstagram, contactPhone, businessEmail } = req.body;

  if (businessEmail && businessEmail !== req.user.businessEmail) {
    throw new AppError("Email change requires verification. Please use OTP verification flow.", HTTP_STATUS.BAD_REQUEST);
  }

  const updateData = {
    organizerName,
    eventCategory,
    experience,
    description,
    websiteOrInstagram,
    contactPhone,
  };

  const updatedVendor = await updateVendorProfileService(vendorId, updateData);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully",
    vendor: updatedVendor,
  });
};

export const sendVendorEmailUpdateOtp = async (req, res) => {
  const vendorId = req.user._id;
  const { newEmail } = req.body;

  if (!newEmail) {
    throw new AppError("New email is required", HTTP_STATUS.BAD_REQUEST);
  }

  const otp = generateOTP();
  await sendVendorEmailUpdateOtpService(vendorId, newEmail, otp);

  try {
    await sendOTP(newEmail, otp);
  } catch (mailError) {
    console.error("Failed to send OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Vendor Email update OTP is:", otp);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "OTP sent to new email address",
  });
};

export const verifyVendorEmailUpdateOtp = async (req, res) => {
  const vendorId = req.user._id;
  const { otp, organizerName, eventCategory, experience, description, websiteOrInstagram, contactPhone } = req.body;

  const updatedVendor = await verifyVendorEmailUpdateOtpService(vendorId, otp, {
    organizerName,
    eventCategory,
    experience,
    description,
    websiteOrInstagram,
    contactPhone,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully",
    vendor: updatedVendor,
  });
};

export const resendVendorEmailUpdateOtp = async (req, res) => {
  const vendorId = req.user._id;

  const otp = generateOTP();
  const tempEmail = await resendVendorEmailUpdateOtpService(vendorId, otp);

  try {
    await sendOTP(tempEmail, otp);
  } catch (mailError) {
    console.error("Failed to resend OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  console.log("Resent Vendor Email update OTP is:", otp);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "OTP resent to new email address",
  });
};

export const createEvent = async(req,res) =>{
  console.log("req.body : " ,req.body)
  console.log("status :",req.body.eventStatus)
  const vendorId = req.user._id

  if(!vendorId){
    throw new AppError("vendor ID is required",HTTP_STATUS.BAD_REQUEST)
  }

  if (req.body.ticketTiers && typeof req.body.ticketTiers === 'string') {
    try {
      req.body.ticketTiers = JSON.parse(req.body.ticketTiers);
    } catch (e) {
      console.error("Error parsing ticketTiers in createEvent:", e);
    }
  }

  let thumbnail = null;

  if (req.files?.thumbnail?.[0]) {
    const thumbnailUpload = await uploadToCloudinary(
      req.files.thumbnail[0].buffer,
      "events/thumbnails"
    )
    thumbnail = {
      fileUrl : thumbnailUpload.secure_url,
      publicId : thumbnailUpload.public_id,
      fileType : thumbnailUpload.resource_type
    }
  } else if (req.body.eventStatus !== 'draft') {
    throw new AppError("Thumbnail is required", HTTP_STATUS.BAD_REQUEST);
  }

  let images = []

  if(req.files?.images?.length){
    for(const image of req.files.images){
      const uploadResult = await uploadToCloudinary(
        image.buffer,
        "events/gallery"
      )

      images.push({
        fileUrl : uploadResult.secure_url,
        publicId : uploadResult.public_id,
        fileType : uploadResult.resource_type
      })
    }
  }

  const event = await createEventService({
    ...req.body,
    vendorId,
    thumbnail: thumbnail || undefined,
    images
  })


  return res.status(HTTP_STATUS.CREATED).json({
    success : true,
    message : "Event Created Successfully",
    event
  })

}

export const getVendorEvents = async(req, res) => {
  const vendorId = req.user._id

  if(!vendorId){
    throw new AppError("vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const events = await getVendorEventsService(vendorId)
  
  

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Events Fetched Successfully",
    events
  })
}

export const cancelEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const event = await cancelEventService(eventId, vendorId)

  if (!event) {
    throw new AppError("Event not found or unauthorized", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Cancelled Successfully",
    event
  })
}

export const updateEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (req.body.ticketTiers && typeof req.body.ticketTiers === 'string') {
    try {
      req.body.ticketTiers = JSON.parse(req.body.ticketTiers);
    } catch (e) {
      console.error("Error parsing ticketTiers in updateEvent:", e);
    }
  }

  let thumbnail = null
  if (req.file) {
    const thumbnailUpload = await uploadToCloudinary(
      req.file.buffer,
      "events/thumbnails"
    )
    thumbnail = {
      fileUrl: thumbnailUpload.secure_url,
      publicId: thumbnailUpload.public_id,
      fileType: thumbnailUpload.resource_type,
    }
  }

  const updatedEvent = await updateEventService(eventId, vendorId, {
    ...req.body,
    thumbnail: thumbnail || undefined,
  })

  if (!updatedEvent) {
    throw new AppError("Event not found or unauthorized to update", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Updated Successfully",
    event: updatedEvent,
  })
}

export const deleteEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const event = await deleteEventService(eventId, vendorId)

  if (!event) {
    throw new AppError("Event not found or cannot be deleted (only cancelled or draft events can be deleted)", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Deleted Successfully",
    event,
  })
}


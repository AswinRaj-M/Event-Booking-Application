import { AppError } from "../../utils/AppError.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { generateOTP } from "../../utils/generateOtp.js";
import { sendOTP } from "../../utils/sendMail.js";

import {
  updateVendorImagesService,
  updateVendorProfileService,
  sendVendorEmailUpdateOtpService,
  verifyVendorEmailUpdateOtpService,
  resendVendorEmailUpdateOtpService,
} from "../../services/vendor/profile.service.js";

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

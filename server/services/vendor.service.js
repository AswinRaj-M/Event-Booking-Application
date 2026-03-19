import Vendor from "../models/vendor.model.js"
import cloudinary from "../config/cloudinary.js"
import streamifier from 'streamifier'
import bcrypt from "bcryptjs"
import { AppError } from "../utils/AppError.js"
import { hashToken } from "../utils/hashToken.js"

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const applyVendor = async (vendorData, files) => {
  const hashedPassword = await bcrypt.hash(vendorData.password, 10)

  if (!files?.businessDocument || !files?.idProof) {
    throw new AppError("business document and ID Proof are required", 400)
  }

  const businessDocUpload = await uploadToCloudinary(
    files.businessDocument[0].buffer,
    "vendorApplication/businessDocs"
  );

  const uploadIdProof = await uploadToCloudinary(
    files.idProof[0].buffer,
    "vendorApplication/idProofs"
  );

  return await Vendor.create({
    organizerName: vendorData.organizerName,
    businessName: vendorData.businessName,
    businessEmail: vendorData.businessEmail,
    password: hashedPassword,
    contactPhone: vendorData.contactPhone,
    eventCategory: vendorData.eventCategory,
    experience: vendorData.experience,
    description: vendorData.description,
    websiteOrInstagram: vendorData.websiteOrInstagram,
    agreeTermsAndConditions: vendorData.agreeTermsAndConditions,
    location: JSON.parse(vendorData.location),
    businessDocument: {
      fileUrl: businessDocUpload.secure_url,
      publicId: businessDocUpload.public_id,
      fileType: businessDocUpload.resource_type
    },
    idProof: {
      fileUrl: uploadIdProof.secure_url,
      publicId: uploadIdProof.public_id,
      fileType: uploadIdProof.resource_type
    },
  })
}

export const vendorLogout = async (token) => {
  if(token){
    const hashed = hashToken(token)
    await Vendor.findOneAndUpdate(
      {refreshToken : hashed},
      {$set : {refreshToken : null}}
    )
  }
}

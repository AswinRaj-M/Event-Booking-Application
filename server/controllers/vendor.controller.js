import Vendor from "../models/vendor.model.js"
import cloudinary from "../config/cloudinary.js"
import streamifier from 'streamifier'
import bcrypt from "bcryptjs"
import { AppError } from "../utils/AppError.js"
import { asyncHandler } from "../middleware/error.middleware.js"

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


export const applyVendor = asyncHandler(async (req, res) => {
  const password = req.body.password
  if (!password) {
    throw new AppError("password is required", 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const existing = await Vendor.findOne({
    businessEmail: req.body.businessEmail
  })

  if (existing) {
    throw new AppError("applicaton already submited with this email", 400)
  }

  if (!req.files?.businessDocument || !req.files?.idProof) {
    throw new AppError("business document and ID Proof are required", 400)
  }

  const businessDocUpload = await uploadToCloudinary(
    req.files.businessDocument[0].buffer,
    "vendorApplication/businessDocs"
  );

  const uploadIdProof = await uploadToCloudinary(
    req.files.idProof[0].buffer,
    "vendorApplication/idProofs"
  );

  const vendor = await Vendor.create({
    organizerName: req.body.organizerName,
    businessName: req.body.businessName,
    businessEmail: req.body.businessEmail,
    password: hashedPassword,
    contactPhone: req.body.contactPhone,
    eventCategory: req.body.eventCategory,
    experience: req.body.experience,
    description: req.body.description,
    websiteOrInstagram: req.body.websiteOrInstagram,
    agreeTermsAndConditions: req.body.agreeTermsAndConditions,
    location: JSON.parse(req.body.location),

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

  res.status(201).json({
    message: "vendor application submited successfully",
    data: {
      _id: vendor._id,
      name: vendor.organizerName,
      email: vendor.businessEmail,
      status: vendor.applicationStatus
    }
  })
});

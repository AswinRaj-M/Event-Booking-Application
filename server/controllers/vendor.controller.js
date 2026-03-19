import Vendor from "../models/vendor.model.js"
import cloudinary from "../config/cloudinary.js"
import streamifier from 'streamifier'
import bcrypt from "bcryptjs"
import { AppError } from "../utils/AppError.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"
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


export const applyVendor = async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

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
}

 export const vendorLogin = async(req,res) =>{
  const vendor = req.vendor

  const accessToken = generateAccessToken(vendor._id, vendor.role)
  const refreshToken = generateRefreshToken(vendor._id)

  vendor.refreshToken = hashToken(refreshToken)
  await vendor.save()

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })


  res.status(200).json({
    vendor : {
      id : vendor._id,
      organizerName : vendor.organizerName,
      businessEmail : vendor.businessEmail,
      businessName : vendor.businessName,
      role : vendor.role,
      applicationStatus : vendor.applicationStatus
    }
  })

}


export const vendorLogout = async(req,res) =>{
  const token = req.cookies.refreshToken
  if(token){
    const hashed = hashToken(token)
    await Vendor.findOneAndUpdate(
      {refreshToken : hashed},
      {$set : {refreshToken : null}}
    )
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  })

  res.clearCookie("refreshToken",{
    httpOnly : true,
    sameSite : "strict",
    secure : process.env.NODE_ENV === "production"
  })

  return res.status(200).json({message : "Logged out Successfully"})
}

export const getVendorMe = async (req, res) => {
  const vendor = req.user;
  if (!vendor || vendor.role !== "vendor") {
    return res.status(401).json({ message: "Not Authorized as Vendor" });
  }

  return res.status(200).json({
    vendor : {
      id : vendor._id,
      organizerName : vendor.organizerName,
      businessEmail : vendor.businessEmail,
      businessName : vendor.businessName,
      role : vendor.role,
      applicationStatus : vendor.applicationStatus
    }
  })
}


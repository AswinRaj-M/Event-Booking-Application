import Vendor from "../models/vendor.model.js"
import cloudinary from "../config/cloudinary.js"
import streamifier from 'streamifier'
import bcrypt from "bcryptjs"

const uploadToCloudinary = (fileBuffer,folder) =>{
  return new Promise((resolve,reject) =>{
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type : "auto"
      },
      (error,result) => {
        if(error) reject(error)
        else resolve(result)
      }
    )

    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}


export const applyVendor = async(req,res) =>{
  try {
    const password = req.body.password
     if(!password){
    return res.status(400).json({
        message : "password is required"
      })
    }

    const hashedPassword = await bcrypt.hash(password,10)
    const existing = await Vendor.findOne({
      businessEmail : req.body.businessEmail
    })

   if(existing){
      return res.status(400).json({message : "applicaton already submited with this email"})
    }

    if(!req.files?.businessDocument || !req.files?.idProof){
      return res.status(400).json({
        message : "business document and ID Proof are required"
      })
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
      organizerName : req.body.organizerName,
      businessName : req.body.businessName,
      businessEmail  : req.body.businessEmail,
      password : hashedPassword,
      contactPhone : req.body.contactPhone,
      eventCategory : req.body.eventCategory,
      experience : req.body.experience,
      description : req.body.description,
      websiteOrInstagram : req.body.websiteOrInstagram,
      agreeTermsAndConditions : req.body.agreeTermsAndConditions,
      location : JSON.parse(req.body.location),

      businessDocument : {
        fileUrl : businessDocUpload.secure_url,
        publicId :businessDocUpload.public_id,
        fileType : businessDocUpload.resource_type
      },
      idProof :{
        fileUrl : uploadIdProof.secure_url,
        publicId : uploadIdProof.public_id,
        fileType : uploadIdProof.resource_type
      },
    })

    res.status(201).json({
      message : "vendor application submited successfully",
      data :{
        _id : vendor._id,
        name : vendor.organizerName,
        email : vendor.businessEmail,
        status : vendor.applicationStatus
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({message : "Server Error"})
  }
}
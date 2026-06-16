import mongoose, { mongo } from "mongoose";
import fileSchema from "./file.schema.js";

const vendorSchema = new mongoose.Schema({
  organizerName: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessEmail: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture : {
    type : fileSchema,
  },
  coverImage : {
    type : fileSchema
  },
  portfolioPictures : {
    type : [fileSchema],
    default :[]
  },

  role: {
    type: String,
    default: "vendor"
  },
  contactPhone: {
    type: String,
    required: true,
  },
  agreeTermsAndConditions: {
    type: Boolean,
    required: true
  },
  emailVerify: {
    type: Boolean,
    defualt: false
  },
  eventCategory: String,
  experience: String,
  description: String,
  websiteOrInstagram: String,
  businessDocument: {
    type: fileSchema,
    required: true
  },
  idProof: {
    type: fileSchema,
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  applicationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  rejectionReason: String,
  refreshToken: String,
}, { timestamps: true })

export default mongoose.model("Vendor", vendorSchema)
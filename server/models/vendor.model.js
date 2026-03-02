import mongoose, { mongo } from "mongoose";

const fileSchema = new mongoose.Schema({
  fileUrl : {
    type : String,
    required : true
  },
  publicId :{
    type : String,
    required : true
  },
  fileType : String
})

const vendorSchema = new mongoose.Schema({
  organizerName : {
    type : String,
    required : true,
    trim : true
  },
  businessName : {
    type : String,
    required : true,
    trim : true
  },
  businessEmail : {
    type : String,
    required : true
  },
  password :{
    type : String,
    required : true
  },
  contactPhone : {
    type : String,
    required : true,
  },
  agreeTermsAndConditions  :{
      type : Boolean,
      required : true
    },
  eventCategory : String,
  experience : String,
  description : String,
  websiteOrInstagram : String,
  businessDocument :{
    type : fileSchema,
    required : true
  },
  idProof :{
    type : fileSchema,
    required : true
  },
  location : {
    city : String,
    state : String,
    country : String
  },
  applicationStatus :{
    type : String,
    enum : ["pending","approved","rejected"],
    default : "pending"
  },
  rejectionReason : String,
},{timestamps : true})

export default mongoose.model("Vendor",vendorSchema)
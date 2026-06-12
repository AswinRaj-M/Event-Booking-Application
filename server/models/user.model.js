import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: String
})

const userSchema = new mongoose.Schema({
    fullName : {
      type :String,
      required : true
    },
    email : {
      type : String,
      required : true,
      unique : true
    },
    phoneNumber :{
      type : String,
      unique : true,
      sparse: true,
    },
    password : {
      type : String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role : {
      type : String,
      default : "user"
    },
    isBlocked : {
      type : Boolean,
      default : false
    },
    walletBalance : {
      type : Number,
      default : 0.00
    },
    agreeTermsAndConditions  :{
      type : Boolean,
      default: true
    },
    isVerified : {
      type : Boolean,
      default : false
    },
    profilePicture :fileSchema,
    refreshToken : {
      type : String,  
    },
    
    passwordChangedAt : Date,

},{timestamps : true})

const User = mongoose.model("User",userSchema)

export default User
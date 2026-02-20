import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail";


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
      required : true,
      unique : true
    },
    password : {
      type : String,
      required : true
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
      required : true
    },
    isVerified : {
      type : Boolean,
      default : false
    },
    otp : String,
    expireOtp :  Date,
    refreshToken : String,

},{timestamps : true})
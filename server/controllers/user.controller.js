import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateOTP } from "../utils/generateOtp.js"
import { OTP_EXPIRE_TIME } from "../utils/constants.js"
import sendOTP from "../utils/sendOtp.js"



export const registerUser = async(req,res) =>{
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      agreeTermsAndConditions,
    } = req.body

    if(password != confirmPassword) {
      return res.status(400).json({message : "Password do not match"})
    }
    if(!agreeTermsAndConditions) {
      return res.status(400).json({message : "You must have to agree the terms and conditions"})
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({message : "Email Already Registered "});
    }

    const hashedPassword = bcrypt.hash(password,10)
    const otp = generateOTP()

    await User.create({
      fullName,
      email,
      phoneNumber,
      password : hashedPassword,
      agreeTermsAndConditions,
      otp,
      otpExpires : Date.now + OTP_EXPIRE_TIME 
    });

    await sendOTP(email,otp)
    res.status(201).json({message : "OTP send to email"})
  } catch (error) {
    res.status(500).json({message : "server Error"})
    console.error(error.message)
  }
}
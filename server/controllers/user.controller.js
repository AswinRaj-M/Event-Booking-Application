import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateOTP } from "../utils/generateOtp.js"
import { OTP_EXPIRE_TIME } from "../utils/constants.js"
import sendOTP from "../utils/sendOtp.js"
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken.js"
import { hashToken } from "../utils/hashToken.js"



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

    const hashedPassword = await bcrypt.hash(password,10)
    const otp = generateOTP()

    await User.create({
      fullName,
      email,
      phoneNumber,
      password : hashedPassword,
      agreeTermsAndConditions,
      otp,
      otpExpires : Date.now() + OTP_EXPIRE_TIME 
    });

    await sendOTP(email,otp)
    res.status(201).json({message : "OTP send to email"})
  } catch (error) {
    res.status(500).json({message : "server Error"})
    console.error(error.message)
  }
}


export const verifyOTP = async (req,res) => {
  try {
    const {email,otp} = req.body
    const user = await User.findOne({email})
    if(!user) 
      return res.status(404).json({message : "User is not found"})

    if(user.otp !== otp) 
      return res.status(400).json({message : "Invalid OTP"})
    
    if(user.otpExpires < Date.now())
      return res.status(400).json({message :  "OTP Was Expired"})

    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = hashToken(refreshToken)
    await user.save()

    res.cookie("refreshToken",refreshToken ,{
      httpOnly : true,
      sameSite : "strict",
      secure : false,
      maxAge : 7 * 24 * 60 * 60 * 1000, 
    })

    res.status(200).json({
      accessToken,
      user : {
        id :user._id,
        fullName : user.fullName,
        email : user.email,
        role : user.role
      }
    })
  } catch (error) {
    res.status(500).json({message : "server Error"})
    console.error(error)
  }
}



export const loginUser = async (req,res) => {
  try {
    const {email,password} = req.body

  const user = await User.findOne({email})
  if(!user || !isVerified)
    res.status(400).json({message : "Invalid Credentials"})
  
  const match = await bcrypt.compare(password,user.password)

  if(!match)
    return res.status(400).json({message : "Password is Incorrect"})


  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  user.refreshToken = hashToken(refreshToken)
  await user.save();

  res.cookie ("refreshToken" ,refreshToken,{
    httpOnly : true,
    secure : false,
    sameSite : "strict",
    maxAge : 7 * 24 * 60 * 60 * 1000,
  })
  
  res.json({accessToken});
  } catch (error) {
    res.status(500).json({message : "Server Error"})
    console.error(error)
  }
  
}



export const refreshAccessToken = async (req,res) =>{
  try {
    const token = req.cookie.refreshToken

    if(!token)
        return res.status(401).json({message : "No Refresh Token"})

    const decode = jwt.verify(token,process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decode.id)

    if(!user || user.refreshToken !== hashToken(token))
      return res.status(403).json({message : "Invalid RefreshToken"})

    const newAccessToken = generateAccessToken(user)

    res.json({accessToken : newAccessToken})
  } catch (error) {
      res.status(403).json({message : "Invalid Refresh Token"})
      console.error(error)
  }
} 



export const logoutUser = async (req,res) => {
    const token = req.cookie.refreshToken;

    if(token){
      const hashed = hashToken(token)
      await User.findOneAndUpdate(
        {refreshToken :hashed},
        {refreshToken : null}
      )
    }

    res.clearCookie("refreshToken")
    res.json({message : "Logged out Successfully"})

}
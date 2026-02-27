import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { generateOTP } from "../utils/generateOtp.js"
import sendOTP from "../utils/sendOtp.js"
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js"
import { hashToken } from "../utils/hashToken.js"
import Otp from "../models/user.otp.model.js"



export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      agreeTermsAndConditions,
    } = req.body

    if (password != confirmPassword) {
      return res.status(400).json({ message: "Password do not match" })
    }
    if (!agreeTermsAndConditions) {
      return res.status(400).json({ message: "You must have to agree the terms and conditions" })
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        console.log(" Error: Email already verified", email)
        return res.status(400).json({ message: "Email Already Registered" });
      } else {
        console.log("register Info: Found unverified user, deleting to allow re-registration", email)
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      agreeTermsAndConditions
    });
    const otp = generateOTP()

    await Otp.create({
      userId : user._id,
      otp
    })
    await sendOTP(email, otp)
    console.log("otp is ",otp)
    console.log("OTP sent to", email)

    return res.status(201).json({
      message : "Otp Send To Email",
      userId : user._id
    })
  } catch (error) {
    console.error("Error from register USer :",error)
    return res.status(500).json({ message: "server Error" })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if(!userId || !otp){
      return res.status(404).json({message : ""})
    }

    const user = await User.findById(userId);

    if (!user)
      return res.status(400).json({ message: "User not found" });
    
    const otpDoc = await Otp.findOne({userId,otp})
    if(!otpDoc){
      return res.status(400).json({message : "Invalid or Expired Otp"})
    }

    user.isVerified = true;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = hashToken(refreshToken);

    await user.save();
    await Otp.deleteOne({userId})

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error from the Verify OTP :",error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.isVerified)
      res.status(400).json({ message: "Invalid Credentials" })

    const match = await bcrypt.compare(password, user.password)

    if (!match)
      return res.status(400).json({ message: "Password is Incorrect" })


    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = hashToken(refreshToken)
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Error from Login User :",error)
   return res.status(500).json({ message: "Server Error" })
  }

}



export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken

    if (!token)
      return res.status(401).json({ message: "No Refresh Token" })

    const decode = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decode.id)

    if (!user || user.refreshToken !== hashToken(token))
      return res.status(403).json({ message: "Invalid RefreshToken" })

    const newAccessToken = generateAccessToken(user)

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error("Error from refreshAccesToke",error)
    return res.status(403).json({ message: "Invalid Refresh Token" })
  }
}



export const logoutUser = async (req, res) => {
  try {
      const token = req.cookies.refreshToken;
  if (token) {
    const hashed = hashToken(token)
    await User.findOneAndUpdate(
      { refreshToken: hashed },
      { $set : {refreshToken: null} }
    )
  }
  
  res.clearCookie("refreshToken",{
    httpOnly : true,
    sameSite : "strict",
    secure : false 
  })

  return res.status(200).json({ message: "Logged out Successfully" })
  } catch (error) {
    console.error("Error from logout user : ",error)
    return res.status(500).json({
      message :"Server Error"
    })
  }
}
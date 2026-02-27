import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";


export const AdminLogin = async(req,res)=>{
  try {
    const {email,password} = req.body
    if(!email || !password){
      return res.status(400).json({message : "Email and Password are Required"})
    }

    const admin = await User.findOne({email})
    if(!admin){
      return res.status(401).json({message : "Invalid Credentials"})
    }

    if(admin.role !== "admin"){
      return res.status(403).json({message : "Access Denied. Not An Admin"})
    }

    const isMatch = await bcrypt.compare(password,admin.password)

    if(!isMatch){
      return res.status(401).json({message : "Invalid Password"})
    }

    const accessToken = generateAccessToken(admin._id,admin.role)
    const refreshToken = generateRefreshToken(admin._id,admin.role)
    admin.refreshToken = hashToken(refreshToken)
    await admin.save()

    res.cookie("refreshToken", refreshToken,{
      httpOnly : true,
      secure : fasle,
      sameSite : "strict",
      maxAge : 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message : "Admin Logged In Successfully",
      accessToken,
      admin :{
        id : admin._id,
        email : admin.email,
        role : admin.role
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({message : "Server Error"})
  }
}
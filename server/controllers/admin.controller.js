import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import Vendor from "../models/vendor.model.js";


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
      secure : false,
      sameSite : "strict",
      maxAge : 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message : "Admin Logged In Successfully",
      accessToken,
      admin :{
        id : admin._id,
        name : admin.fullName,
        email : admin.email,
        role : admin.role
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({message : "Server Error"})
  }
}


export const logoutAdmin = async(req,res) =>{
  try {
    const token = req.cookies.refreshToken

    if(token){
      const hashed = hashToken(token)
      await User.findOneAndUpdate(
        {refreshToken : hashed},
        {$set : {refreshToken : null}}
      )
    }

    res.clearCookie("refreshToken",{
      httpOnly : true,
      sameSite : "strict",
      secure : false
    })
    return res.status(200).json({message : "Admin Logged Out Successfully"})
  } catch (error) {
    console.error("Error from the admin logout",error)
    return res.status(500).json({message : "Server Error"})
  }
}

export const getAllVendors = async(req,res) =>{
  try {
      const {status} = req.query

      let filter = {}

      if(status){
        filter.applicationStatus = status
      }

      const vendors = await Vendor.find(filter)
        .select("-password")
        .sort({createdAt : -1})


      return res.status(200).json({
        success : true,
        count : vendors.length,
        data : vendors
      })


  } catch (error) {
    console.error("Error from admin get all vendors ")
    return res.status(500).json({
      success : false,
      message :  "Server Error"
    }) 
  }
}


export const getVendorById = async(req,res) =>{
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select("-password")

    if(!vendor){
      return res.status(404).json({
        success : false,
        message : "Vendor not Found"
      })
    }

    return res.status(200).json({
      success : true,
      data : vendor
    })
  } catch (error) {
    console.error("Error from the get vendor by id ",error)
    return res.status(500).json({
      success : false,
      message : "Server Error"
    })
  }
}
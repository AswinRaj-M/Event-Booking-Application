import jwt, { decode } from "jsonwebtoken";
import { generateOTP } from "../utils/generateOtp.js";
import { sendMail, sendOTP } from "../utils/sendMail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  registerUserService,
  createOtpService,
  verifyOtpService,
  loginUserService,
  updateRefreshTokenService,
  refreshAccessTokenService,
  logoutUserService,
  resendOtpService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";


export const registerUser = async (req, res) => {
  const user = await registerUserService(req.body);

  const otp = generateOTP();

  await createOtpService(user._id, otp);

  try {
    await sendOTP(user.email, otp);
  } catch (mailError) {
    console.error("Failed to send OTP:", mailError);
    throw new AppError(
      "User registered but failed to send verification email. Please try to login to resend OTP.",
      500
    );
  }

  console.log("otp is ", otp);
  console.log("OTP sent to", user.email);

  return res.status(201).json({
    message: "Otp Send To Email",
    userId: user._id,
    email: user.email,
  });
};


export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await verifyOtpService(userId, otp);

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  await updateRefreshTokenService(user._id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
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
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { user, unverified } = await loginUserService(email, password);

  if (unverified) {
    const otp = generateOTP();
    await createOtpService(user._id, otp);
    try {
      await sendOTP(user.email, otp);
    } catch (error) {
      console.log("Error from the login otp send : ", error);
      throw new AppError("Failed to send otp, Try again later ", 500);
    }
    console.log("Login OTP is : ", otp);

    return res.status(200).json({
      unverified: true,
      message: "Account not verified. OTP sent to your email.",
      userId: user._id,
      email: user.email,
    });
  }

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  await updateRefreshTokenService(user._id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};



export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // store refresh token (optional but recommended)
    user.refreshToken = refreshToken;
    await user.save();

    // send cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

  
    const userData = {
      id: user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
    };

    res.redirect(
      `${process.env.CLIENT_PORT}/auth/success?accessToken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}`
    );
  } catch (error) {
    console.log(error);
    res.redirect("http://localhost:5173/login");
  }
};

export const resendOtp = async(req,res) =>{
  const {userId} =  req.body

  const otp = generateOTP()
 
  const user  = await resendOtpService(userId,otp)

  try {
    await sendOTP(user.email,otp)
  } catch (error) {
    console.log("Error from the resend otp : ",error)
    throw new AppError("Failed to resend otp, Try again later ",500)
  }
  console.log("resend otp : ",otp)
  res.status(200).json({
    succuss : true,
    message : "Otp resend Successfully"
  })
}

export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError("No Refresh Token", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid Refresh Token", 403);
  }

  const user = await refreshAccessTokenService(token, decoded);

  const newAccessToken = generateAccessToken(user);

  return res.json({ accessToken: newAccessToken });
};

export const forgotPassword = async(req,res) =>{
  const {email} = req.body

  const {resetToken, user } = await forgotPasswordService(email)

  const resetUrl = `${process.env.CLIENT_PORT}/reset-password/${resetToken}`

  try {
    await sendMail(email,resetUrl,"Reset link")
  } catch (error) {
    console.log("Error from send Reset link to email :",error)
    throw new AppError("Something went Wrong",500)
  }
  console.log("reset Url : ",resetUrl)

  return res.status(200).json({
    success : true,
    message : "Reset Link Send To Email"
  })
}


export const resetPassword = async(req,res) =>{
  const {resetToken,password} = req.body

  if(!resetToken) throw new AppError("Token is required !",400)
  
  let decoded;

  try {
    decoded = jwt.verify(resetToken,process.env.JWT_RESET_SECRET)
  } catch (error) {
    throw new AppError("Invalid or Expired Token",400)
  }

  await resetPasswordService(decoded.id,password)

  res.status(200).json({
    success : true,
    message : "Password reset Succesfully",
  })
}


export const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;

  await logoutUserService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  return res.status(200).json({
    message: "Logged out Successfully",
  });
};
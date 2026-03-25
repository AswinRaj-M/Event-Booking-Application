import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOTP } from "../utils/sendMail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import {
  registerUserService,
  createOtpService,
  verifyOtpService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
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
  });
};


export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const refreshToken = generateRefreshToken({ id: userId });

  const user = await verifyOtpService(userId, otp, refreshToken);

  const accessToken = generateAccessToken(user);

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

  const refreshToken = generateRefreshToken({ email });

  const user = await loginUserService(email, password, refreshToken);

  const accessToken = generateAccessToken(user);

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
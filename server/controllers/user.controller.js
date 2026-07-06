import jwt, { decode } from "jsonwebtoken";
import { generateOTP } from "../utils/generateOtp.js";
import { sendMail, sendOTP } from "../utils/sendMail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
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
  getUserProfileService,
  updateUserProfileService,
  getExploreEventsService,
  sendEmailUpdateOtpService,
  verifyEmailUpdateOtpService,
  resendEmailUpdateOtpService,
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
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  return res.status(200).json({
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
      console.error("Error from the login otp send : ", error);
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  return res.json({
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

  
    const userData = {
      id: user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
    };

    res.redirect(
      `${process.env.CLIENT_PORT}/auth/success?user=${encodeURIComponent(JSON.stringify(userData))}`
    );
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.CLIENT_PORT}/login`);
  }
};

export const resendOtp = async(req,res) =>{
  const {userId} =  req.body

  const otp = generateOTP()
 
  const user  = await resendOtpService(userId,otp)

  try {
    await sendOTP(user.email,otp)
  } catch (error) {
    console.error("Error from the resend otp : ",error)
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
    console.warn(`[Token Refresh] Missing refresh token cookie in req.cookies`);
    throw new AppError("No Refresh Token", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
   
  } catch (error) {
    console.error(`[Token Refresh] JWT verification failed for refresh token:`, error.message);
    throw new AppError("Invalid Refresh Token", 403);
  }

  try {
    const user = await refreshAccessTokenService(token, decoded);

    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.json({ success: true });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(error.statusCode || 403).json({
      message: error.message || "Forbidden"
    });
  }
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
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(200).json({
    message: "Logged out Successfully",
  });
};

export const getUserProfile = async (req, res) => {
  const userId = req.user._id;
  const user = await getUserProfileService(userId);
  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      walletBalance: user.walletBalance,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user._id;
  const { fullName, phoneNumber, email } = req.body;

  if (email && email !== req.user.email) {
    throw new AppError("Email change requires verification. Please use OTP verification flow.", 400);
  }

  const updatedUser = await updateUserProfileService(userId, { fullName, phoneNumber });
  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

export const sendEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;
  const { newEmail } = req.body;

  if (!newEmail) {
    throw new AppError("New email is required", 400);
  }

  const otp = generateOTP();
  await sendEmailUpdateOtpService(userId, newEmail, otp);

  try {
    await sendOTP(newEmail, otp);
  } catch (mailError) {
    console.error("Failed to send OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", 500);
  }

  console.log("Email update OTP is:", otp);

  return res.status(200).json({
    success: true,
    message: "OTP sent to new email address",
  });
};

export const verifyEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;
  const { otp, fullName, phoneNumber } = req.body;

  const updatedUser = await verifyEmailUpdateOtpService(userId, otp, { fullName, phoneNumber });

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

export const resendEmailUpdateOtp = async (req, res) => {
  const userId = req.user._id;

  const otp = generateOTP();
  const tempEmail = await resendEmailUpdateOtpService(userId, otp);

  try {
    await sendOTP(tempEmail, otp);
  } catch (mailError) {
    console.error("Failed to resend OTP to new email:", mailError);
    throw new AppError("Failed to send verification email. Please try again.", 500);
  }

  console.log("Resent Email update OTP is:", otp);

  return res.status(200).json({
    success: true,
    message: "OTP resent to new email address",
  });
};

export const updateUserProfilePicture = async (req, res) => {
  const userId = req.user._id;
  
  if (!req.file) {
    throw new AppError("Profile picture file required", 400);
  }
  
  const uploadResult = await uploadToCloudinary(
    req.file.buffer,
    "user/profilePictures"
  );
  
  const profilePicture = {
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    fileType: uploadResult.resource_type
  };
  
  const updatedUser = await updateUserProfileService(userId, { profilePicture });
  
  return res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      walletBalance: updatedUser.walletBalance,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
    },
  });
};

export const getExploreEvents = async (req, res) => {
  const { search, category, date, page, limit } = req.query;
  const result = await getExploreEventsService({ search, category, date, page, limit });
  return res.status(200).json({
    success: true,
    ...result
  });
};
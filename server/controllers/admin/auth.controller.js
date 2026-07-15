import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import { hashToken } from "../../utils/hashToken.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  adminLoginService,
  logoutAdminService,
} from "../../services/admin/auth.service.js";

import { saveAdmin } from "../../repository/admin/auth.repo.js";

export const AdminLogin = async (req, res) => {
  const { email, password } = req.body;
 

  const admin = await adminLoginService(email, password);

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshToken = hashToken(refreshToken);
  await saveAdmin(admin);


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

  res.status(HTTP_STATUS.OK).json({
    message: "Admin Logged In Successfully",
    admin: {
      id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
};


export const logoutAdmin = async (req, res) => {
  const token = req.cookies.refreshToken;

  await logoutAdminService(token);

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

  return res.status(HTTP_STATUS.OK).json({
    message: "Admin Logged Out Successfully",
  });
};

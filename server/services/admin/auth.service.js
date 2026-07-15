import bcrypt from "bcryptjs";
import { hashToken } from "../../utils/hashToken.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  findAdminByEmail,
  clearAdminRefreshToken,
} from "../../repository/admin/auth.repo.js";

export const adminLoginService = async (email, password) => {
  if (!email || !password) {
    throw new AppError("Email and Password are Required", HTTP_STATUS.BAD_REQUEST);
  }

  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new AppError("Invalid Credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  if (admin.role !== "admin") {
    throw new AppError("Access Denied. Not An Admin", HTTP_STATUS.FORBIDDEN);
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new AppError("Invalid Password", HTTP_STATUS.UNAUTHORIZED);
  }

  return admin;
};

export const logoutAdminService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearAdminRefreshToken(hashed);
  }
};

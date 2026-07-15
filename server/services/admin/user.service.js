import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import User from "../../models/user.model.js";

import {
  getallusersRepo,
} from "../../repository/admin/user.repo.js";

export const getAllUsersService = async() => {
  return await getallusersRepo();
};

export const toggleUserBlockService = async(id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }
  user.isBlocked = !user.isBlocked;
  if (user.isBlocked) {
    user.refreshToken = null;
  }
  await user.save();
  return user;
};

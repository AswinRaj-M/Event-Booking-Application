import User from "../../models/user.model.js";

export const findAdminByEmail = async (email) => {
  return await User.findOne({ email });
};

export const saveAdmin = async (admin) => {
  return await admin.save();
};

export const clearAdminRefreshToken = async (token) => {
  return await User.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
};

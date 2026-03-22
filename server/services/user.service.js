import User from "../models/user.model.js"

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const deleteUserById = async (id) => {
  return await User.deleteOne({ _id: id });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const updateUserRefreshToken = async (id, hashedToken) => {
  return await User.findByIdAndUpdate(id, { refreshToken: hashedToken }, { new: true });
};

export const verifyUserEmail = async (id) => {
  return await User.findByIdAndUpdate(id, { isVerified: true }, { new: true });
};

export const updateUserPassword = async (id, hashedPassword) => {
  return await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
};

export const clearUserRefreshToken = async (hashedToken) => {
  return await User.findOneAndUpdate(
    { refreshToken: hashedToken },
    { $set: { refreshToken: null } }
  );
};

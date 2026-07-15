import User from "../../models/user.model.js";
import Otp from "../../models/user.otp.model.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


export const createUser = async (data) => {
  return await User.create(data);
};


export const deleteUserById = async (userId) => {
  return await User.deleteOne({ _id: userId });
};


export const updateRefreshToken = async (userId, token) => {
  return await User.findByIdAndUpdate(
    userId,
    { refreshToken: token },
    { new: true }
  );
};


export const findByRefreshToken = async (token) => {
  return await User.findOne({ refreshToken: token });
};




export const upsertOtp = async (userId, otp, extraData = {}) => {
  return await Otp.findOneAndUpdate(
    { userId },
    { otp, createdAt: Date.now(), ...extraData },
    { upsert: true, new: true }
  );
};


export const findOtpByUserId = async (userId) => {
  return await Otp.findOne({ userId });
};

export const deleteOtpByUserId = async (userId) => {
  return await Otp.deleteOne({ userId });
};

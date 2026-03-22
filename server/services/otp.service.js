import Otp from "../models/user.otp.model.js"

export const createOTP = async (userId, otpValue) => {
  return await Otp.create({ userId, otp: otpValue });
};

export const findOTPRecord = async (userId, otpValue) => {
  return await Otp.findOne({ userId, otp: otpValue });
};

export const deleteAllOTPByUserId = async (userId) => {
  return await Otp.deleteMany({ userId });
};

export const deleteOTPRecord = async (userId) => {
  return await Otp.deleteOne({ userId });
};

import User from "../models/user.model.js";
import Otp from "../models/user.otp.model.js";
import Event from "../models/event.model.js";




export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


export const findUserById = async (userId) => {
  return await User.findById(userId);
};


export const createUser = async (data) => {
  return await User.create(data);
};


export const deleteUserById = async (userId) => {
  return await User.deleteOne({ _id: userId });
};


export const updateUser = async (userId, data) => {
  return await User.findByIdAndUpdate(userId, data, {
    new: true,
  });
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




export const upsertOtp = async (userId, otp) => {
  return await Otp.findOneAndUpdate(
    { userId },
    { otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );
};


export const findOtpByUserId = async (userId) => {
  return await Otp.findOne({ userId });
};

export const updatePassword = async(userId,password) =>{
  return await User.findByIdAndUpdate(
    userId,
    {
      password,
      passwordChangedAt : Date.now()
    },
    {new : true}
  )
}

export const deleteOtpByUserId = async (userId) => {
  return await Otp.deleteOne({ userId });
};

export const getExploreEventsRepo = async () => {
  return await Event.find({ 
    isDeleted: { $ne: true }, 
    isBlocked: { $ne: true }, 
    eventStatus: { $ne: "draft" } 
  })
  .populate("category")
  .populate("vendorId")
  .sort({ createdAt: -1 });
};
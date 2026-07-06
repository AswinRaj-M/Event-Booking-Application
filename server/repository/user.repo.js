import mongoose from "mongoose";
import User from "../models/user.model.js";
import Otp from "../models/user.otp.model.js";
import Event from "../models/event.model.js";
import Category from "../models/category.model.js";




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

export const getExploreEventsRepo = async (filters = {}) => {
  const { search, category, date } = filters;
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 9;
  const skip = (page - 1) * limit;

  const query = {
    isDeleted: { $ne: true },
    isBlocked: { $ne: true },
    eventStatus: { $ne: "draft" }
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } }
    ];
  }

  if (date) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
    query["schedule.date"] = { $gte: startDate, $lte: endDate };
  }

  if (category) {
    let catId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const catDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
      if (catDoc) {
        catId = catDoc._id;
      } else {
        catId = new mongoose.Types.ObjectId();
      }
    }
    query.category = catId;
  }

  const totalEvents = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate("category")
    .populate("vendorId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    events,
    totalEvents,
    totalPages: Math.ceil(totalEvents / limit),
    currentPage: page
  };
};
import mongoose from "mongoose";
import Review from "../../models/review.model.js";

export const createReviewRepo = async ({ userId, vendorId, eventId, rating, feedback }) => {
  return await Review.create({
    userId,
    vendorId,
    eventId,
    rating,
    feedback,
  });
};

export const findUserReviewForEventRepo = async (userId, eventId) => {
  return await Review.findOne({ userId, eventId }).lean();
};

export const findUserReviewsRepo = async (userId) => {
  return await Review.find({ userId })
    .populate("eventId", "title schedule venue city thumbnail")
    .populate("vendorId", "organizerName businessName profilePicture")
    .sort({ createdAt: -1 })
    .lean();
};

export const getOrganizerReviewsRepo = async (vendorId, skip = 0, limit = 10) => {
  const query = { vendorId: new mongoose.Types.ObjectId(vendorId) };

  const [reviews, totalReviews] = await Promise.all([
    Review.find(query)
      .populate("userId", "fullName profilePicture")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(query),
  ]);

  return { reviews, totalReviews };
};

export const getEventRatingSummaryRepo = async (eventId) => {
  const summary = await Review.aggregate([
    {
      $match: { eventId: new mongoose.Types.ObjectId(eventId) },
    },
    {
      $group: {
        _id: "$eventId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (summary.length === 0) {
    return { avgRating: 0, totalReviews: 0 };
  }

  return {
    avgRating: Math.round(summary[0].avgRating * 10) / 10,
    totalReviews: summary[0].totalReviews,
  };
};

export const getOrganizerRatingSummaryRepo = async (vendorId) => {
  const summary = await Review.aggregate([
    {
      $match: { vendorId: new mongoose.Types.ObjectId(vendorId) },
    },
    {
      $group: {
        _id: "$vendorId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (summary.length === 0) {
    return { avgRating: 0, totalReviews: 0 };
  }

  return {
    avgRating: Math.round(summary[0].avgRating * 100) / 100,
    totalReviews: summary[0].totalReviews,
  };
};

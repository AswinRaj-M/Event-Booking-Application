import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";
import Vendor from "../../models/vendor.model.js";
import Review from "../../models/review.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

export const getExploreEventsRepo = async (filters = {}) => {
  await updateCompletedEvents();

  const { search, category, date, sortBy } = filters;
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 9;
  const skip = (page - 1) * limit;

  const query = {
    isDeleted: { $ne: true },
    isBlocked: { $ne: true },
    eventStatus: { $nin: ["draft", "completed", "cancelled"] }
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

  const sortObj = {};
  if (sortBy === "price_asc") {
    sortObj["ticketTiers.price"] = 1;
  } else if (sortBy === "price_desc") {
    sortObj["ticketTiers.price"] = -1;
  } else {
    sortObj["createdAt"] = -1;
  }

  const totalEvents = await Event.countDocuments(query);
  const totalUsers = await User.countDocuments({ role: "user", isBlocked: { $ne: true } });
  const events = await Event.find(query)
    .populate("category")
    .populate("vendorId")
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  return {
    events,
    totalEvents,
    totalUsers,
    totalPages: Math.ceil(totalEvents / limit),
    currentPage: page
  };
};

export const findEventById = async (id) => {
  await updateCompletedEvents();
  return await Event.findById(id).populate("category").populate("vendorId");
};

export const getOrganizersRepo = async (limit = 8) => {
  await updateCompletedEvents();

  const organizers = await Event.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
        eventStatus: { $nin: ["draft", "cancelled"] }
      }
    },
    {
      $group: {
        _id: "$vendorId",
        totalEvents: { $sum: 1 }
      }
    },
    {
      $match: {
        totalEvents: { $gte: 1 }
      }
    },
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "_id",
        as: "vendor"
      }
    },
    {
      $unwind: "$vendor"
    },
    {
      $match: {
        "vendor.applicationStatus": "approved",
        "vendor.isBlocked": { $ne: true }
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "vendorId",
        as: "allReviews"
      }
    },
    {
      $lookup: {
        from: "reviews",
        let: { vendorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$vendorId", "$$vendorId"] }
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $limit: 50
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDoc"
            }
          },
          {
            $unwind: {
              path: "$userDoc",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              rating: 1,
              feedback: 1,
              createdAt: 1,
              reviewerName: { $ifNull: ["$userDoc.fullName", "Verified Attendee"] },
              reviewerAvatar: "$userDoc.profilePicture.fileUrl"
            }
          }
        ],
        as: "recentReviews"
      }
    },
    {
      $addFields: {
        totalReviews: { $size: "$allReviews" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$allReviews" }, 0] },
            { $avg: "$allReviews.rating" },
            0
          ]
        }
      }
    },
    {
      $project: {
        _id: "$vendor._id",
        organizerName: "$vendor.organizerName",
        businessName: "$vendor.businessName",
        profilePicture: "$vendor.profilePicture",
        eventCategory: "$vendor.eventCategory",
        location: "$vendor.location",
        description: "$vendor.description",
        totalEvents: 1,
        rating: { $round: ["$avgRating", 2] },
        totalReviews: 1,
        recentReviews: 1
      }
    },
    {
      $sort: {
        rating: -1,
        totalReviews: -1,
        totalEvents: -1
      }
    },
    {
      $limit: Number(limit) || 8
    }
  ]);

  return organizers;
};

export const getOrganizerProfileRepo = async (vendorId) => {
  await updateCompletedEvents();

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return null;
  }

  const vId = new mongoose.Types.ObjectId(vendorId);

  // 1. Fetch Vendor details (excluding sensitive fields)
  const vendorDoc = await Vendor.findOne({
    _id: vId,
    applicationStatus: "approved",
    isBlocked: { $ne: true }
  }).select("-password -refreshToken -businessDocument -idProof").lean();

  if (!vendorDoc) {
    return null;
  }

  // 2. Fetch completed events for this vendor
  const completedEvents = await Event.find({
    vendorId: vId,
    isDeleted: { $ne: true },
    eventStatus: "completed"
  })
    .populate("category")
    .sort({ "schedule.date": -1, createdAt: -1 })
    .lean();

  // 3. Fetch reviews & calculate rating summary
  const [reviews, summary] = await Promise.all([
    Review.find({ vendorId: vId })
      .populate("userId", "fullName profilePicture")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .lean(),
    Review.aggregate([
      { $match: { vendorId: vId } },
      {
        $group: {
          _id: "$vendorId",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ])
  ]);

  const avgRating = summary.length > 0 ? Math.round(summary[0].avgRating * 100) / 100 : 0;
  const totalReviews = summary.length > 0 ? summary[0].totalReviews : 0;

  return {
    vendor: vendorDoc,
    completedEvents,
    reviews,
    avgRating,
    totalReviews,
    totalCompletedEvents: completedEvents.length
  };
};


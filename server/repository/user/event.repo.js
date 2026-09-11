import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";
import Vendor from "../../models/vendor.model.js";
import Review from "../../models/review.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

export const getExploreEventsRepo = async (filters = {}, userId = null) => {
  await updateCompletedEvents();

  const { search, category, date, sortBy, followedOnly } = filters;
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 9;
  const skip = (page - 1) * limit;

  const query = {
    isDeleted: { $ne: true },
    isBlocked: { $ne: true },
    eventStatus: { $nin: ["draft", "completed", "cancelled"] }
  };

  if ((followedOnly === "true" || followedOnly === true) && userId) {
    const userDoc = await User.findById(userId).select("followingOrganizers").lean();
    const following = userDoc?.followingOrganizers || [];
    query.vendorId = { $in: following };
  }

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
  return await Event.findOne({ _id: id, isDeleted: { $ne: true }, isBlocked: { $ne: true } }).populate("category").populate("vendorId");
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

export const getOrganizerProfileRepo = async (vendorId, userId = null, options = {}) => {
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

  // 2. Pagination for completed events
  const page = Math.max(1, parseInt(options.eventsPage, 10) || 1);
  const limit = Math.max(1, parseInt(options.eventsLimit, 10) || 6);
  const skip = (page - 1) * limit;

  const eventQuery = {
    vendorId: vId,
    isDeleted: { $ne: true },
    isBlocked: { $ne: true },
    eventStatus: "completed"
  };

  const [completedEvents, totalCompletedEvents] = await Promise.all([
    Event.find(eventQuery)
      .populate("category")
      .sort({ "schedule.date": -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Event.countDocuments(eventQuery)
  ]);

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

  // 4. Check if current user is following this vendor
  let isFollowing = false;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const userDoc = await User.findOne({
      _id: userId,
      followingOrganizers: vId
    }).select("_id").lean();
    isFollowing = !!userDoc;
  }

  const avgRating = summary.length > 0 ? Math.round(summary[0].avgRating * 100) / 100 : 0;
  const totalReviews = summary.length > 0 ? summary[0].totalReviews : 0;
  const eventsTotalPages = Math.ceil(totalCompletedEvents / limit) || 1;

  return {
    vendor: vendorDoc,
    completedEvents,
    reviews,
    avgRating,
    totalReviews,
    totalCompletedEvents,
    eventsCurrentPage: page,
    eventsTotalPages,
    isFollowing,
    followersCount: vendorDoc.followersCount || 0
  };
};

export const toggleFollowOrganizerRepo = async (userId, vendorId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(vendorId)) {
    throw new Error("Invalid User or Vendor ID");
  }

  const uId = new mongoose.Types.ObjectId(userId);
  const vId = new mongoose.Types.ObjectId(vendorId);

  const vendor = await Vendor.findOne({ _id: vId, applicationStatus: "approved", isBlocked: { $ne: true } });
  if (!vendor) {
    throw new Error("Organizer not found or blocked");
  }

  const user = await User.findById(uId);
  if (!user) {
    throw new Error("User not found");
  }

  const isAlreadyFollowing = (user.followingOrganizers || []).some(id => id.toString() === vId.toString());

  if (isAlreadyFollowing) {
    await User.findByIdAndUpdate(uId, { $pull: { followingOrganizers: vId } });
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vId,
      { $inc: { followersCount: -1 } },
      { new: true }
    );
    const count = Math.max(0, updatedVendor?.followersCount || 0);
    if (updatedVendor && updatedVendor.followersCount < 0) {
      await Vendor.findByIdAndUpdate(vId, { $set: { followersCount: 0 } });
    }
    return { isFollowing: false, followersCount: count };
  } else {
    await User.findByIdAndUpdate(uId, { $addToSet: { followingOrganizers: vId } });
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vId,
      { $inc: { followersCount: 1 } },
      { new: true }
    );
    return { isFollowing: true, followersCount: updatedVendor?.followersCount || 1 };
  }
};



import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";
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
        totalEvents: { $sum: 1 },
        avgRating: {
          $avg: {
            $cond: [
              { $gt: ["$averageRating", 0] },
              "$averageRating",
              "$$REMOVE"
            ]
          }
        },
        totalReviews: { $sum: "$totalReviews" }
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
      $project: {
        _id: "$vendor._id",
        organizerName: "$vendor.organizerName",
        businessName: "$vendor.businessName",
        profilePicture: "$vendor.profilePicture",
        eventCategory: "$vendor.eventCategory",
        location: "$vendor.location",
        description: "$vendor.description",
        totalEvents: 1,
        rating: { $ifNull: [{ $round: ["$avgRating", 1] }, 0] },
        totalReviews: 1
      }
    },
    {
      $sort: {
        totalEvents: -1,
        rating: -1
      }
    },
    {
      $limit: Number(limit) || 8
    }
  ]);

  return organizers;
};

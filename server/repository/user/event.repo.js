import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import Category from "../../models/category.model.js";

export const getExploreEventsRepo = async (filters = {}) => {
  const { search, category, date, sortBy } = filters;
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

  const sortObj = {};
  if (sortBy === "price_asc") {
    sortObj["ticketTiers.price"] = 1;
  } else if (sortBy === "price_desc") {
    sortObj["ticketTiers.price"] = -1;
  } else {
    sortObj["createdAt"] = -1;
  }

  const totalEvents = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate("category")
    .populate("vendorId")
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  return {
    events,
    totalEvents,
    totalPages: Math.ceil(totalEvents / limit),
    currentPage: page
  };
};

export const findEventById = async (id) => {
  return await Event.findById(id).populate("category").populate("vendorId");
};

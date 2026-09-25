import Booking from "../../models/booking.model.js";
import Event from "../../models/event.model.js";
import User from "../../models/user.model.js";

export const findUserIdsBySearchRepo = async (searchRegex) => {
  const users = await User.find({
    $or: [{ fullName: searchRegex }, { email: searchRegex }],
  }).select("_id");
  return users.map((u) => u._id);
};

export const findEventIdsBySearchRepo = async (searchRegex) => {
  const events = await Event.find({ title: searchRegex }).select("_id");
  return events.map((e) => e._id);
};

export const findAdminBookingsRepo = async (query, skip, limitNum) => {
  return await Booking.find(query)
    .populate("userId", "fullName email phoneNumber profilePicture")
    .populate({
      path: "eventId",
      select: "title thumbnail images ticketPrice schedule vendorId category",
      populate: {
        path: "vendorId",
        select: "organizerName businessName fullName name email",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();
};

export const countAdminBookingsRepo = async (query) => {
  return await Booking.countDocuments(query);
};

export const getAdminBookingKpiMetricsRepo = async () => {
  const [totalBookingsCount, activeEventsCount, cancelledBookingsCount, revenueStats] =
    await Promise.all([
      Booking.countDocuments({ bookingStatus: { $ne: "expired" } }),
      Event.countDocuments({ isDeleted: false, isBlocked: false }),
      Booking.countDocuments({ bookingStatus: "cancelled" }),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: { $in: ["paid", "completed"] },
            bookingStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

  const totalRevenue = revenueStats[0]?.totalRevenue || 0;
  return {
    totalBookingsCount,
    activeEventsCount,
    cancelledBookingsCount,
    totalRevenue,
  };
};

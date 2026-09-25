import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import UserWalletTransaction from "../../models/userWalletTransaction.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

export const createEventRepo = async(data) =>{
  return await Event.create(data)
}

export const getVendorEventsRepo = async(vendorId) => {
  await updateCompletedEvents();
  return await Event.find({ vendorId, isDeleted: { $ne: true } })
  .sort({createdAt : -1})
  .populate("category")
}

export const cancelEventRepo = async (eventId, vendorId) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId },
    { $set: { eventStatus: "cancelled" } },
    { new: true }
  )
}

export const updateEventRepo = async (eventId, vendorId, updateData) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId },
    { $set: updateData },
    { new: true }
  ).populate("category")
}

export const deleteEventRepo = async (eventId, vendorId) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId, eventStatus: { $in: ["cancelled", "draft"] } },
    { $set: { isDeleted: true } },
    { new: true }
  )
}

export const findVendorEventByIdRepo = async (eventId, vendorId) => {
  return await Event.findOne({ _id: eventId, vendorId });
};

export const findPaidBookingsForEventCancellationRepo = async (eventId) => {
  return await Booking.find({
    eventId: eventId,
    bookingStatus: { $in: ["confirmed", "completed"] },
    paymentStatus: "paid",
  });
};

export const saveBookingDocRepo = async (booking) => {
  return await booking.save();
};

export const findEventCancellationUserRefundTxRepo = async (bookingId) => {
  return await UserWalletTransaction.findOne({
    "metadata.bookingId": bookingId,
    "metadata.eventCancellation": true,
    transactionType: "refund",
    status: "completed",
  });
};

export const getTierBookingCountsRepo = async (eventId) => {
  return await Booking.aggregate([
    {
      $match: {
        eventId: eventId,
        bookingStatus: { $in: ["confirmed", "completed"] },
        paymentStatus: { $in: ["paid", "free", "completed", "success", "SUCCESS"] },
      },
    },
    {
      $group: {
        _id: "$tierId",
        totalSold: { $sum: "$quantity" },
      },
    },
  ]);
};

export const completeEventBookingsRepo = async (eventId) => {
  return await Booking.updateMany(
    { eventId: eventId, bookingStatus: { $in: ["confirmed", "checked-in"] } },
    { $set: { bookingStatus: "completed" } }
  );
};

export const getEventsBookingCountsRepo = async (eventIds) => {
  return await Booking.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        bookingStatus: { $in: ["confirmed", "completed"] },
        paymentStatus: { $in: ["paid", "free", "completed", "success", "SUCCESS"] },
      },
    },
    {
      $group: {
        _id: "$eventId",
        totalSold: { $sum: "$quantity" },
      },
    },
  ]);
};


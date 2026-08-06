import Refund from "../../models/refund.model.js";

export const createRefundRepo = async (refundData) => {
  return await Refund.create(refundData);
};

export const findRefundByBookingIdRepo = async (bookingId) => {
  return await Refund.findOne({ bookingId });
};

export const findRefundsByUserIdRepo = async (userId) => {
  return await Refund.find({ userId })
    .populate({
      path: "eventId",
      select: "title schedule venue city thumbnail eventType",
    })
    .populate({
      path: "bookingId",
      select: "bookingId quantity totalAmount paymentStatus bookingStatus",
    })
    .sort({ createdAt: -1 });
};

export const findRefundByIdRepo = async (refundId) => {
  return await Refund.findById(refundId)
    .populate("eventId")
    .populate("bookingId")
    .populate("userId", "fullName email phoneNumber");
};

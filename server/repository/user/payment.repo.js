import Payment from "../../models/payment.model.js";
import Booking from "../../models/booking.model.js";
import Event from "../../models/event.model.js";
import User from "../../models/user.model.js";

export const createPaymentRepo = async (paymentData) => {
  return await Payment.create(paymentData);
};

export const findPaymentByRazorpayOrderIdRepo = async (razorpayOrderId) => {
  return await Payment.findOne({ razorpayOrderId })
    .populate("userId", "name email contact profilePicture")
    .populate({
      path: "orderId",
      populate: { path: "eventId", select: "title images venue city schedule ticketPrice" }
    });
};

export const findPaymentByIdRepo = async (id) => {
  return await Payment.findById(id)
    .populate("userId", "name email contact profilePicture")
    .populate({
      path: "orderId",
      populate: { path: "eventId", select: "title images venue city schedule ticketPrice" }
    });
};

export const findPaymentsByUserIdRepo = async (userId) => {
  return await Payment.find({ userId })
    .populate({
      path: "orderId",
      populate: { path: "eventId", select: "title images venue city schedule" }
    })
    .sort({ createdAt: -1 });
};

export const updatePaymentStatusRepo = async (razorpayOrderId, updateData) => {
  return await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { $set: updateData },
    { new: true }
  );
};

export const findEventForPaymentRepo = async (eventId) => {
  return await Event.findOne({ _id: eventId, isDeleted: false });
};

export const findEventByIdForPaymentRepo = async (eventId) => {
  return await Event.findById(eventId);
};

export const findBookingByIdForPaymentRepo = async (bookingId) => {
  return await Booking.findById(bookingId);
};

export const saveBookingForPaymentRepo = async (booking) => {
  return await booking.save();
};

export const updateBookingStatusOnPaymentFailureRepo = async (bookingId) => {
  return await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus: "failed",
    bookingStatus: "failed",
    isInventoryReleased: true,
  });
};

export const deductUserWalletBalanceForPaymentRepo = async (userId, payableAmount) => {
  return await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: payableAmount } },
    { $inc: { walletBalance: -payableAmount } },
    { new: true }
  );
};

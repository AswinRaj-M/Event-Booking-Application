import Payment from "../../models/payment.model.js";

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

import mongoose from "mongoose";
import Booking from "../../models/booking.model.js";
import Event from "../../models/event.model.js";
import Coupon from "../../models/coupon.model.js";
import User from "../../models/user.model.js";
import Payment from "../../models/payment.model.js";
import CouponRedemption from "../../models/couponRedemption.model.js";
import UserWalletTransaction from "../../models/userWalletTransaction.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

/**
 * Execute operations inside a MongoDB transaction session with automatic standalone fallback
 */
export const runInTransactionRepo = async (fn) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (err.message && (err.message.includes("replica set") || err.message.includes("Transaction numbers"))) {
      return await fn(null);
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Cleanup expired pending bookings and release reserved inventory
 */
export const cleanupExpiredBookingsRepo = async (cutoffDate = new Date()) => {
  return await Booking.updateMany(
    {
      bookingStatus: "pending",
      checkoutExpiresAt: { $lt: cutoffDate },
    },
    {
      $set: {
        bookingStatus: "expired",
        paymentStatus: "expired",
        isInventoryReleased: true,
      },
    }
  );
};

export const createBookingRepo = async (bookingData) => {
  return await Booking.create(bookingData);
};

export const findBookingByIdRepo = async (bookingId) => {
  return await Booking.findById(bookingId)
    .populate({
      path: "eventId",
      select: "title description schedule venue address city thumbnail eventType eventStatus isBlocked cancellationPolicy",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .populate({
      path: "userId",
      select: "fullName email phoneNumber",
    });
};

export const findBookingRawByIdRepo = async (bookingId) => {
  return await Booking.findById(bookingId);
};

export const findUserBookingsRepo = async (userId) => {
  await updateCompletedEvents();

  return await Booking.find({
    userId,
    paymentStatus: { $nin: ["failed", "expired", "pending"] },
    bookingStatus: { $nin: ["failed", "expired", "pending"] },
    $or: [
      { paymentStatus: { $in: ["paid", "refunded", "completed", "success", "SUCCESS", "free"] } },
      { bookingStatus: { $in: ["confirmed", "checked-in", "completed", "cancelled"] } },
    ],
  })
    .populate({
      path: "eventId",
      select: "title schedule venue city thumbnail eventType category eventStatus isBlocked cancellationPolicy",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .sort({ createdAt: -1 });
};

export const findBookingByTicketRepo = async (ticketId) => {
  return await Booking.findOne({ "tickets.ticketId": ticketId })
    .populate("eventId")
    .populate("userId");
};

export const saveBookingRepo = async (bookingDocument, options = {}) => {
  return await bookingDocument.save(options);
};

export const decrementEventSoldCountRepo = async (eventId, tierId) => {
  if (!eventId) return null;
  const update = { $inc: { soldTickets: -1 } };
  if (tierId) {
    return await Event.updateOne(
      { _id: eventId, "ticketTiers._id": tierId },
      { $inc: { soldTickets: -1, "ticketTiers.$.sold": -1 } }
    );
  }
  return await Event.findByIdAndUpdate(eventId, update, { new: true });
};

export const findEventForBookingRepo = async (eventId) => {
  return await Event.findOne({ _id: eventId, isDeleted: false });
};

export const countActivePendingTierTicketsRepo = async (eventId, validTierId) => {
  const activePending = await Booking.aggregate([
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
        bookingStatus: "pending",
        checkoutExpiresAt: { $gt: new Date() },
        $or: [
          { tierId: validTierId },
          { "tickets.tierId": validTierId },
        ],
      },
    },
    { $unwind: { path: "$tickets", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { "tickets.tierId": validTierId },
          { tierId: validTierId },
        ],
      },
    },
    { $group: { _id: null, totalPending: { $sum: { $ifNull: ["$tickets.quantity", "$quantity"] } } } },
  ]);
  return activePending[0]?.totalPending || 0;
};

export const incrementEventTicketSalesRepo = async (eventId, tickets, fallbackTierId, fallbackQuantity) => {
  if (tickets && tickets.length > 0) {
    for (const tItem of tickets) {
      if (tItem.tierId) {
        await Event.updateOne(
          { _id: eventId, "ticketTiers._id": tItem.tierId },
          { $inc: { soldTickets: tItem.quantity, "ticketTiers.$.sold": tItem.quantity } }
        );
      } else {
        await Event.updateOne(
          { _id: eventId },
          { $inc: { soldTickets: tItem.quantity } }
        );
      }
    }
  } else if (fallbackTierId) {
    await Event.updateOne(
      { _id: eventId, "ticketTiers._id": fallbackTierId },
      { $inc: { soldTickets: fallbackQuantity, "ticketTiers.$.sold": fallbackQuantity } }
    );
  } else {
    await Event.updateOne(
      { _id: eventId },
      { $inc: { soldTickets: fallbackQuantity } }
    );
  }
};

export const consumeCouponOnBookingRepo = async (couponCode, userId, bookingId, discountAmount) => {
  const coupon = await Coupon.findOne({ code: couponCode });
  if (coupon) {
    const existingRedemption = await CouponRedemption.findOne({ bookingId });
    if (!existingRedemption) {
      coupon.usedCount += 1;
      await coupon.save();

      await CouponRedemption.create({
        couponId: coupon._id,
        userId,
        bookingId,
        discountApplied: discountAmount,
      });
    }
  }
};

export const findEventWithVendorForNotificationRepo = async (eventId) => {
  return await Event.findById(eventId).populate("vendorId", "_id organizerName businessName");
};

export const findCustomerNameByIdRepo = async (userId) => {
  return await User.findById(userId).select("fullName");
};

export const updateBookingQrTokenRepo = async (bookingId, qrCodeToken) => {
  return await Booking.updateOne({ _id: bookingId }, { $set: { qrCodeToken } });
};

export const findPriorUserRefundTransactionsRepo = async (bookingId) => {
  return await UserWalletTransaction.find({
    "metadata.bookingId": bookingId,
    transactionType: "refund",
    status: "completed",
  });
};

export const findUserRefundTransactionRepo = async (query, session) => {
  return session
    ? await UserWalletTransaction.findOne(query).session(session)
    : await UserWalletTransaction.findOne(query);
};

export const updateBookingPaymentsToRefundedRepo = async (bookingId, session) => {
  const query = { orderId: bookingId, status: { $in: ["SUCCESS", "PAID", "CREATED"] } };
  const update = { $set: { status: "REFUNDED" } };
  return session
    ? await Payment.updateMany(query, update).session(session)
    : await Payment.updateMany(query, update);
};

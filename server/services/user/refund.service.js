import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { findBookingByIdRepo } from "../../repository/user/booking.repo.js";
import {
  createRefundRepo,
  findRefundByBookingIdRepo,
  findRefundsByUserIdRepo,
} from "../../repository/user/refund.repo.js";

/**
 * STEP 74 - Refund Eligibility Validation
 */
export const validateRefundEligibilityService = async (userId, bookingId, allowedLimitHours = 24) => {
  if (!bookingId) {
    throw new AppError("Booking ID is required for refund validation", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Booking exists
  const booking = await findBookingByIdRepo(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);
  }

  // 2. Booking belongs to the logged-in user
  const bookingUserId = booking.userId?._id
    ? booking.userId._id.toString()
    : booking.userId.toString();

  if (bookingUserId !== userId.toString()) {
    throw new AppError("You are not authorized to request a refund for this booking", HTTP_STATUS.FORBIDDEN);
  }

  // 3. Payment status is "paid"
  if (booking.paymentStatus !== "paid") {
    throw new AppError("Refund can only be requested for paid bookings", HTTP_STATUS.BAD_REQUEST);
  }

  // 4. Booking is not already cancelled
  if (booking.bookingStatus === "cancelled") {
    throw new AppError("Booking has already been cancelled", HTTP_STATUS.BAD_REQUEST);
  }

  // 5. Booking has not already been refunded
  if (booking.paymentStatus === "refunded") {
    throw new AppError("Booking has already been refunded", HTTP_STATUS.BAD_REQUEST);
  }

  // 6. No refund request already exists
  const existingRefund = await findRefundByBookingIdRepo(booking._id);
  if (existingRefund) {
    throw new AppError(
      `A refund request already exists for this booking (Status: ${existingRefund.status})`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 7. Event has not started & 8. Cancellation window has not expired
  const event = booking.eventId;
  if (!event || !event.schedule || !event.schedule.date) {
    throw new AppError("Event schedule details missing", HTTP_STATUS.BAD_REQUEST);
  }

  const eventStartDate = new Date(event.schedule.date);
  if (event.schedule.startTime) {
    const [hours, minutes] = event.schedule.startTime.split(":").map(Number);
    eventStartDate.setHours(hours || 0, minutes || 0, 0, 0);
  }

  const now = new Date();

  // 7. Event has not started
  if (now >= eventStartDate) {
    throw new AppError("Refund cannot be requested after the event has started", HTTP_STATUS.BAD_REQUEST);
  }

  // 8. Cancellation window has not expired
  const limitInMillis = allowedLimitHours * 60 * 60 * 1000;
  const cancellationDeadline = new Date(eventStartDate.getTime() - limitInMillis);

  if (now > cancellationDeadline) {
    throw new AppError(
      `Cancellation window for refund has expired. Refunds must be requested at least ${allowedLimitHours} hours before the event start time.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 9. None of the tickets in the booking have already been checked in
  if (booking.tickets && booking.tickets.length > 0) {
    const hasCheckedInTicket = booking.tickets.some(
      (ticket) => ticket.status === "checked-in"
    );
    if (hasCheckedInTicket) {
      throw new AppError(
        "Refund cannot be processed because one or more tickets in this booking have already been checked in",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  return {
    eligible: true,
    bookingId: booking._id,
    bookingCode: booking.bookingId,
    amount: booking.totalAmount,
    eventId: event._id || event,
    eventTitle: event.title,
    cancellationDeadline,
  };
};

/**
 * STEP 75 - Refund Request Flow (Create Refund Request)
 */
export const createRefundRequestService = async (userId, bookingId, reason = "") => {
  // First run Step 74 validation checks
  const eligibility = await validateRefundEligibilityService(userId, bookingId);

  const booking = await findBookingByIdRepo(bookingId);

  const refundData = {
    bookingId: booking._id,
    userId: userId,
    eventId: booking.eventId._id || booking.eventId,
    amount: booking.totalAmount,
    reason: reason ? reason.trim() : "",
    status: "pending",
    requestedAt: new Date(),
  };

  const newRefund = await createRefundRepo(refundData);

  return newRefund;
};

/**
 * Get User Refund Requests
 */
export const getUserRefundsService = async (userId) => {
  return await findRefundsByUserIdRepo(userId);
};

import mongoose from "mongoose";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import {
  createReviewRepo,
  findUserReviewForEventRepo,
  findUserReviewsRepo,
  getOrganizerReviewsRepo,
  getEventRatingSummaryRepo,
  getOrganizerRatingSummaryRepo,
} from "../../repository/user/review.repo.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

const parseTime = (timeStr) => {
  if (!timeStr) return { hours: 23, minutes: 59 };
  const cleaned = String(timeStr).trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 23, minutes: 59 };
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
};

const isEventFinished = (event) => {
  if (!event) return false;
  if (event.eventStatus === "completed") return true;

  if (event.schedule && event.schedule.date) {
    const d = new Date(event.schedule.date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    const { hours, minutes } = parseTime(event.schedule.endTime);
    const endDateTime = new Date(year, month, date, hours, minutes, 0, 0);
    return new Date() > endDateTime;
  }
  return false;
};

export const createOrganizerReviewService = async ({ userId, eventId, rating, feedback }) => {
  await updateCompletedEvents();

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError("Invalid Event ID", HTTP_STATUS.BAD_REQUEST);
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new AppError("Rating must be a number between 1 and 5", HTTP_STATUS.BAD_REQUEST);
  }

  if (!feedback || typeof feedback !== "string" || feedback.trim().length < 5) {
    throw new AppError("Feedback must be at least 5 characters long", HTTP_STATUS.BAD_REQUEST);
  }

  if (feedback.trim().length > 1000) {
    throw new AppError("Feedback cannot exceed 1000 characters", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Fetch Event
  const event = await Event.findOne({ _id: eventId, isDeleted: { $ne: true } });
  if (!event) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }

  if (event.eventStatus === "cancelled" || event.eventStatus === "draft") {
    throw new AppError("Cannot review cancelled or draft events", HTTP_STATUS.BAD_REQUEST);
  }

  // 2. Verify Event is Completed
  const completed = isEventFinished(event);
  if (!completed) {
    throw new AppError("Reviews can only be submitted after the event is completed", HTTP_STATUS.BAD_REQUEST);
  }

  // 3. Verify User Purchased & Attended the Event
  const booking = await Booking.findOne({
    userId,
    eventId,
    paymentStatus: "paid",
    bookingStatus: { $in: ["confirmed", "checked-in", "completed"] },
  });

  if (!booking) {
    throw new AppError(
      "You can only review organizers for events you have purchased and attended",
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Ensure at least one ticket was valid / not cancelled
  const hasValidTicket = Array.isArray(booking.tickets) && booking.tickets.some((t) => t.status !== "cancelled");
  if (!hasValidTicket && booking.bookingStatus === "cancelled") {
    throw new AppError("Cannot review an event with a cancelled booking", HTTP_STATUS.FORBIDDEN);
  }

  // 4. Verify User Has Not Already Reviewed This Event
  const existingReview = await findUserReviewForEventRepo(userId, eventId);
  if (existingReview) {
    throw new AppError("You have already reviewed this event organizer", HTTP_STATUS.CONFLICT);
  }

  // 5. Create Review
  const vendorId = event.vendorId;
  const review = await createReviewRepo({
    userId,
    vendorId,
    eventId,
    rating: numericRating,
    feedback: feedback.trim(),
  });

  // 6. Update Event's averageRating and totalReviews in DB
  const eventRatingSummary = await getEventRatingSummaryRepo(eventId);
  await Event.findByIdAndUpdate(eventId, {
    averageRating: eventRatingSummary.avgRating,
    totalReviews: eventRatingSummary.totalReviews,
  });

  return review;
};

export const getUserReviewsService = async (userId) => {
  return await findUserReviewsRepo(userId);
};

export const getEventReviewStatusService = async (userId, eventId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new AppError("Invalid Event ID", HTTP_STATUS.BAD_REQUEST);
  }
  const review = await findUserReviewForEventRepo(userId, eventId);
  return {
    hasReviewed: !!review,
    review: review || null,
  };
};

export const getOrganizerReviewsService = async (vendorId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    throw new AppError("Invalid Vendor ID", HTTP_STATUS.BAD_REQUEST);
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (p - 1) * l;

  const [{ reviews, totalReviews }, summary] = await Promise.all([
    getOrganizerReviewsRepo(vendorId, skip, l),
    getOrganizerRatingSummaryRepo(vendorId),
  ]);

  return {
    reviews,
    totalReviews,
    averageRating: summary.avgRating,
    totalPages: Math.ceil(totalReviews / l),
    currentPage: p,
  };
};

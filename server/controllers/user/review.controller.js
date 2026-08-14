import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import {
  createOrganizerReviewService,
  getUserReviewsService,
  getEventReviewStatusService,
  getOrganizerReviewsService,
} from "../../services/user/review.service.js";

export const createOrganizerReview = async (req, res) => {
  const userId = req.user._id;
  const { eventId, rating, feedback } = req.body;

  const review = await createOrganizerReviewService({
    userId,
    eventId,
    rating,
    feedback,
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Thank you for your feedback! Your review has been recorded.",
    review,
  });
};

export const getMyReviews = async (req, res) => {
  const userId = req.user._id;
  const reviews = await getUserReviewsService(userId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    reviews,
  });
};

export const getEventReviewStatus = async (req, res) => {
  const userId = req.user._id;
  const { eventId } = req.params;
  const status = await getEventReviewStatusService(userId, eventId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    ...status,
  });
};

export const getOrganizerReviews = async (req, res) => {
  const { vendorId } = req.params;
  const { page, limit } = req.query;

  const data = await getOrganizerReviewsService(vendorId, page, limit);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    ...data,
  });
};

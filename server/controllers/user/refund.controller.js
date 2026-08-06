import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import {
  validateRefundEligibilityService,
  createRefundRequestService,
  getUserRefundsService,
} from "../../services/user/refund.service.js";

/**
 * Check if a booking is eligible for a refund (Step 74)
 */
export const checkRefundEligibility = async (req, res) => {
  const userId = req.user._id;
  const { bookingId } = req.params;

  const eligibility = await validateRefundEligibilityService(userId, bookingId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Booking is eligible for a refund",
    eligibility,
  });
};

/**
 * Submit a refund request (Step 75)
 */
export const requestRefund = async (req, res) => {
  const userId = req.user._id;
  const { bookingId, reason } = req.body;

  if (!bookingId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Booking ID is required to request a refund",
    });
  }

  const refund = await createRefundRequestService(userId, bookingId, reason);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Refund request submitted successfully",
    refund,
  });
};

/**
 * Get all refund requests for the logged-in user
 */
export const getUserRefunds = async (req, res) => {
  const userId = req.user._id;

  const refunds = await getUserRefundsService(userId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Refund requests fetched successfully",
    refunds,
  });
};

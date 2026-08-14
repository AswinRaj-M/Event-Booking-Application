import { 
  findCouponByCodeRepo, 
  countUserCouponRedemptionsRepo,
  findActivePublicCouponsRepo
} from "../../repository/user/coupon.repo.js";
import Event from "../../models/event.model.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const validateAndApplyCoupon = async (couponCode, userId, eventId, subtotal, ticketCount = 1) => {
  if (!couponCode) {
    throw new AppError("Coupon code is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (eventId) {
    const event = await Event.findById(eventId);
    if (!event || event.isDeleted) {
      throw new AppError("Event not found or is currently unavailable", HTTP_STATUS.NOT_FOUND);
    }
    if (event.isBlocked) {
      throw new AppError("This event is blocked by admin", HTTP_STATUS.FORBIDDEN);
    }
  }

  const cleanCode = couponCode.trim().toUpperCase();
  const coupon = await findCouponByCodeRepo(cleanCode);
  if (!coupon) {
    throw new AppError("Invalid coupon code", HTTP_STATUS.NOT_FOUND);
  }

  if (!coupon.isActive) {
    throw new AppError("This coupon is currently inactive", HTTP_STATUS.BAD_REQUEST);
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    throw new AppError("This coupon is not active yet", HTTP_STATUS.BAD_REQUEST);
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    throw new AppError("This coupon has expired", HTTP_STATUS.BAD_REQUEST);
  }

  if (coupon.usedCount >= coupon.usagelimit) {
    throw new AppError("This coupon usage limit has been reached", HTTP_STATUS.BAD_REQUEST);
  }

  const userRedemptionCount = await countUserCouponRedemptionsRepo(coupon._id, userId);

  if (userRedemptionCount >= coupon.perUserLimit) {
    throw new AppError("You have already used this coupon maximum number of times", HTTP_STATUS.BAD_REQUEST);
  }

  if (coupon.applicableEvents && coupon.applicableEvents.toString() !== eventId.toString()) {
    throw new AppError("This coupon is not applicable for this event", HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Minimum Ticket Requirement Validation (Applies only to Percentage coupons)
  if (coupon.discountType === "percentage") {
    const minRequiredTickets = Number(coupon.minTickets) || 1;
    const purchasedTickets = Number(ticketCount) || 1;
    if (minRequiredTickets > 1 && purchasedTickets < minRequiredTickets) {
      throw new AppError(
        `This coupon requires a minimum purchase of ${minRequiredTickets} tickets. You have selected ${purchasedTickets} ticket${purchasedTickets > 1 ? 's' : ''}.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // 2. Minimum Order Value Validation
  if (coupon.minPurchaseAmount && Number(coupon.minPurchaseAmount) > 0 && subtotal < Number(coupon.minPurchaseAmount)) {
    throw new AppError(
      `Minimum order value of ₹${Number(coupon.minPurchaseAmount).toLocaleString()} is required to use this coupon.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 3. Discount Calculation based on actual ticket price (subtotal)
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    // Calculate percentage discount based on actual subtotal (ticketPrice * quantity)
    discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
    
    // 4. Maximum Discount Limit enforcement
    if (coupon.maxDiscountAmount && Number(coupon.maxDiscountAmount) > 0) {
      if (discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = Number(coupon.discountValue);
  }

  // Ensure discount does not exceed subtotal and cannot be negative
  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }
  if (discountAmount < 0) {
    discountAmount = 0;
  }

  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
};

export const getActivePublicCouponsService = async () => {
  return await findActivePublicCouponsRepo();
};

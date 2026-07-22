import { 
  findCouponByCodeRepo, 
  countUserCouponRedemptionsRepo,
  findActivePublicCouponsRepo
} from "../../repository/user/coupon.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const validateAndApplyCoupon = async (couponCode, userId, eventId, subtotal) => {
  if (!couponCode) {
    throw new AppError("Coupon code is required", HTTP_STATUS.BAD_REQUEST);
  }

  const coupon = await findCouponByCodeRepo(couponCode);
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

  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    throw new AppError(`Minimum purchase amount of ₹${coupon.minPurchaseAmount} is required for this coupon`, HTTP_STATUS.BAD_REQUEST);
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount does not exceed subtotal
  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
};

export const getActivePublicCouponsService = async () => {
  return await findActivePublicCouponsRepo();
};

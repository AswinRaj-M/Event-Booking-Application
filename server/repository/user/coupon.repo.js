import Coupon from "../../models/coupon.model.js";
import CouponRedemption from "../../models/couponRedemption.model.js";

export const findCouponByCodeRepo = async (couponCode) => {
  if (!couponCode) return null;
  return await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
};

export const countUserCouponRedemptionsRepo = async (couponId, userId) => {
  return await CouponRedemption.countDocuments({
    couponId: couponId,
    userId: userId
  });
};

export const findActivePublicCouponsRepo = async () => {
  const now = new Date();
  return await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ createdAt: -1 });
};

export const createCouponRedemptionRepo = async (redemptionData) => {
  return await CouponRedemption.create(redemptionData);
};

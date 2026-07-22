import { validateAndApplyCoupon, getActivePublicCouponsService } from "../../services/user/coupon.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const validateCoupon = async (req, res) => {
  const userId = req.user._id;
  const { couponCode, eventId, subtotal } = req.body;

  if (!couponCode || !eventId || subtotal === undefined) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "couponCode, eventId, and subtotal are required"
    });
  }

  const { coupon, discountAmount } = await validateAndApplyCoupon(
    couponCode,
    userId,
    eventId,
    Number(subtotal)
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Coupon applied successfully!",
    discountAmount,
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  });
};

export const getPublicCoupons = async (req, res) => {
  const coupons = await getActivePublicCouponsService();
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    coupons
  });
};

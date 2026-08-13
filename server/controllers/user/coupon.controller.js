import { validateAndApplyCoupon, getActivePublicCouponsService } from "../../services/user/coupon.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const validateCoupon = async (req, res) => {
  const userId = req.user._id;
  const { couponCode, eventId, subtotal, quantity, ticketCount } = req.body;

  if (!couponCode || !eventId || subtotal === undefined) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "couponCode, eventId, and subtotal are required"
    });
  }

  const ticketsNumber = Number(quantity !== undefined ? quantity : ticketCount) || 1;

  const { coupon, discountAmount } = await validateAndApplyCoupon(
    couponCode,
    userId,
    eventId,
    Number(subtotal),
    ticketsNumber
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Coupon "${coupon.code}" applied successfully!`,
    discountAmount,
    couponCode: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minTickets: coupon.minTickets || 1,
    minPurchaseAmount: coupon.minPurchaseAmount || 0
  });
};

export const getPublicCoupons = async (req, res) => {
  const coupons = await getActivePublicCouponsService();
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    coupons
  });
};

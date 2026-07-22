import { 
  createCouponService,
  getAllCouponsService,
  toggleCouponStatusService,
  deleteCouponService
} from "../../services/admin/couponManage.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const createCoupon = async (req, res) => {
  const coupon = await createCouponService(req.body);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Coupon created successfully!",
    coupon
  });
};

export const getAllCoupons = async (req, res) => {
  const result = await getAllCouponsService(req.query);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Coupons fetched successfully!",
    coupons: result.coupons,
    pagination: {
      totalCoupons: result.totalCoupons,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit
    }
  });
};

export const toggleCouponStatus = async (req, res) => {
  const { id } = req.params;
  const coupon = await toggleCouponStatusService(id);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Coupon ${coupon.isActive ? "enabled" : "disabled"} successfully!`,
    coupon
  });
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  await deleteCouponService(id);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Coupon deleted successfully!"
  });
};

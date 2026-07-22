import { 
  createCouponRepo, 
  findCouponByCode, 
  findAllCouponsRepo, 
  updateCouponRepo, 
  deleteCouponRepo,
  findCouponByIdRepo
} from "../../repository/admin/couponManage.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const createCouponService = async (data) => {
  const {
    code,
    discountType,
    discountValue,
    endDate,
    usagelimit,
    usageLimit,
  } = data;

  const limitValue = usagelimit || usageLimit;

  if (!code || !discountType || !discountValue || !endDate || !limitValue) {
    throw new AppError("Missing required parameters!", HTTP_STATUS.BAD_REQUEST);
  }

  const existingCoupon = await findCouponByCode(code);

  if (existingCoupon) {
    throw new AppError("This coupon already exists", HTTP_STATUS.CONFLICT);
  }

  const cleanData = { ...data };
  if (!cleanData.applicableEvents || typeof cleanData.applicableEvents !== "string" || cleanData.applicableEvents.trim() === "") {
    delete cleanData.applicableEvents;
  }

  if (cleanData.maxDiscountAmount === 0 || cleanData.maxDiscountAmount === "" || cleanData.maxDiscountAmount === null) {
    delete cleanData.maxDiscountAmount;
  }

  return createCouponRepo({
    ...cleanData,
    code: code.trim().toUpperCase(),
    usagelimit: Number(limitValue),
    discountValue: Number(discountValue),
    minPurchaseAmount: Number(cleanData.minPurchaseAmount) || 0
  });
};

export const getAllCouponsService = async (queryParams = {}) => {
  return await findAllCouponsRepo(queryParams);
};

export const toggleCouponStatusService = async (id) => {
  const coupon = await findCouponByIdRepo(id);
  if (!coupon) {
    throw new AppError("Coupon not found", HTTP_STATUS.NOT_FOUND);
  }
  return await updateCouponRepo(id, { isActive: !coupon.isActive });
};

export const deleteCouponService = async (id) => {
  const coupon = await findCouponByIdRepo(id);
  if (!coupon) {
    throw new AppError("Coupon not found", HTTP_STATUS.NOT_FOUND);
  }
  return await deleteCouponRepo(id);
};

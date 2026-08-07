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

const validateCouponPayload = (data) => {
  const code = (data.code || "").trim().toUpperCase();
  if (!code) {
    throw new AppError("Coupon code is required", HTTP_STATUS.BAD_REQUEST);
  }

  const codeRegex = /^[A-Z0-9_-]{3,20}$/;
  if (!codeRegex.test(code)) {
    throw new AppError("Coupon code must be 3-20 characters long and contain only uppercase letters, numbers, hyphens, or underscores", HTTP_STATUS.BAD_REQUEST);
  }

  const discountType = data.discountType || "percentage";
  const discountVal = Number(data.discountValue);
  if (isNaN(discountVal) || discountVal <= 0) {
    throw new AppError("Discount value must be a number greater than 0", HTTP_STATUS.BAD_REQUEST);
  }

  if (discountType === "percentage" && discountVal > 100) {
    throw new AppError("Percentage discount cannot exceed 100%", HTTP_STATUS.BAD_REQUEST);
  }

  const minPurchase = Number(data.minPurchaseAmount);
  if (!isNaN(minPurchase) && minPurchase < 0) {
    throw new AppError("Minimum order amount cannot be negative", HTTP_STATUS.BAD_REQUEST);
  }

  if (data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null && data.maxDiscountAmount !== "") {
    const maxDiscount = Number(data.maxDiscountAmount);
    if (isNaN(maxDiscount) || maxDiscount < 0) {
      throw new AppError("Maximum discount amount cannot be negative", HTTP_STATUS.BAD_REQUEST);
    }
  }

  const limitVal = Number(data.usagelimit || data.usageLimit);
  if (isNaN(limitVal) || limitVal < 1 || !Number.isInteger(limitVal)) {
    throw new AppError("Usage limit must be a positive integer (at least 1)", HTTP_STATUS.BAD_REQUEST);
  }

  if (!data.endDate) {
    throw new AppError("Expiry date is required", HTTP_STATUS.BAD_REQUEST);
  }

  const expDate = new Date(data.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(expDate.getTime()) || expDate < today) {
    throw new AppError("Expiry date cannot be a past date", HTTP_STATUS.BAD_REQUEST);
  }
};

export const createCouponService = async (data) => {
  validateCouponPayload(data);

  const cleanCode = data.code.trim().toUpperCase();
  const existingCoupon = await findCouponByCode(cleanCode);

  if (existingCoupon) {
    throw new AppError("A coupon with this code already exists", HTTP_STATUS.CONFLICT);
  }

  const limitValue = data.usagelimit || data.usageLimit;

  const cleanData = { ...data };
  if (!cleanData.applicableEvents || typeof cleanData.applicableEvents !== "string" || cleanData.applicableEvents.trim() === "") {
    delete cleanData.applicableEvents;
  }

  if (cleanData.maxDiscountAmount === 0 || cleanData.maxDiscountAmount === "" || cleanData.maxDiscountAmount === null) {
    delete cleanData.maxDiscountAmount;
  }

  return createCouponRepo({
    ...cleanData,
    code: cleanCode,
    usagelimit: Number(limitValue),
    discountValue: Number(data.discountValue),
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

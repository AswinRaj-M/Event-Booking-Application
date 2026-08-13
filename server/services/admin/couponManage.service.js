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

  if (discountType === "percentage") {
    if (discountVal > 100) {
      throw new AppError("Percentage discount cannot exceed 100%", HTTP_STATUS.BAD_REQUEST);
    }

    const minPurchase = Number(data.minPurchaseAmount);
    if (!isNaN(minPurchase) && minPurchase < 0) {
      throw new AppError("Minimum order amount cannot be negative", HTTP_STATUS.BAD_REQUEST);
    }

    if (data.minTickets !== undefined && data.minTickets !== null && data.minTickets !== "") {
      const minTkts = Number(data.minTickets);
      if (isNaN(minTkts) || minTkts < 1 || !Number.isInteger(minTkts)) {
        throw new AppError("Minimum ticket requirement must be an integer (at least 1)", HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null && data.maxDiscountAmount !== "") {
      const maxDiscount = Number(data.maxDiscountAmount);
      if (isNaN(maxDiscount) || maxDiscount < 0) {
        throw new AppError("Maximum discount amount cannot be negative", HTTP_STATUS.BAD_REQUEST);
      }
    }
  } else if (discountType === "fixed") {
    const minPurchase = Number(data.minPurchaseAmount);
    if (isNaN(minPurchase) || minPurchase <= 0) {
      throw new AppError("Minimum order value is required and must be greater than 0 for fixed amount coupons", HTTP_STATUS.BAD_REQUEST);
    }

    if (discountVal >= minPurchase) {
      throw new AppError(
        `Discount value (₹${discountVal}) must be strictly less than Minimum Order Value (₹${minPurchase})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  } else {
    throw new AppError("Invalid discount type. Must be either 'percentage' or 'fixed'", HTTP_STATUS.BAD_REQUEST);
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
  const isFixed = data.discountType === "fixed";

  const cleanData = { ...data };
  if (!cleanData.applicableEvents || typeof cleanData.applicableEvents !== "string" || cleanData.applicableEvents.trim() === "") {
    delete cleanData.applicableEvents;
  }

  if (isFixed || cleanData.maxDiscountAmount === 0 || cleanData.maxDiscountAmount === "" || cleanData.maxDiscountAmount === null) {
    delete cleanData.maxDiscountAmount;
  }

  return createCouponRepo({
    ...cleanData,
    code: cleanCode,
    discountType: data.discountType || "percentage",
    usagelimit: Number(limitValue),
    discountValue: Number(data.discountValue),
    minPurchaseAmount: Number(cleanData.minPurchaseAmount) || 0,
    minTickets: isFixed ? 1 : (Number(cleanData.minTickets) || 1)
  });
};

export const updateCouponService = async (id, data) => {
  const existingCoupon = await findCouponByIdRepo(id);
  if (!existingCoupon) {
    throw new AppError("Coupon not found", HTTP_STATUS.NOT_FOUND);
  }

  validateCouponPayload(data);

  const cleanCode = data.code.trim().toUpperCase();
  if (cleanCode !== existingCoupon.code) {
    const duplicate = await findCouponByCode(cleanCode);
    if (duplicate && duplicate._id.toString() !== id.toString()) {
      throw new AppError("A coupon with this code already exists", HTTP_STATUS.CONFLICT);
    }
  }

  const limitValue = data.usagelimit || data.usageLimit || existingCoupon.usagelimit;
  const isFixed = data.discountType === "fixed";

  const updateData = {
    code: cleanCode,
    displayName: data.displayName !== undefined ? data.displayName.trim() : existingCoupon.displayName,
    description: data.description !== undefined ? data.description.trim() : existingCoupon.description,
    discountType: data.discountType || existingCoupon.discountType,
    discountValue: Number(data.discountValue),
    minPurchaseAmount: Number(data.minPurchaseAmount) || 0,
    minTickets: isFixed ? 1 : (Number(data.minTickets) || 1),
    startDate: data.startDate || existingCoupon.startDate,
    endDate: data.endDate || existingCoupon.endDate,
    usagelimit: Number(limitValue),
    perUserLimit: Number(data.perUserLimit) || existingCoupon.perUserLimit || 1,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : existingCoupon.isActive,
    isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : existingCoupon.isPublic
  };

  if (!isFixed && data.maxDiscountAmount && Number(data.maxDiscountAmount) > 0) {
    updateData.maxDiscountAmount = Number(data.maxDiscountAmount);
  } else {
    updateData.maxDiscountAmount = undefined;
  }

  if (data.applicableEvents && typeof data.applicableEvents === "string" && data.applicableEvents.trim() !== "") {
    updateData.applicableEvents = data.applicableEvents;
  }

  return await updateCouponRepo(id, updateData);
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

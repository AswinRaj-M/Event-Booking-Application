import Coupon from "../../models/coupon.model.js";

export const findCouponByCode = async (code) => {
  if (!code) return null;
  return Coupon.findOne({
    code: code.toUpperCase(),
    isDeleted: { $ne: true }
  });
};

export const createCouponRepo = async (data) => {
  return Coupon.create(data);
};

export const findAllCouponsRepo = async ({ page = 1, limit = 5, search = "", statusFilter = "", scopeFilter = "" } = {}) => {
  const query = { isDeleted: { $ne: true } };

  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { code: searchRegex },
      { displayName: searchRegex },
      { description: searchRegex }
    ];
  }

  if (statusFilter && statusFilter !== "All Status") {
    if (statusFilter === "Active") {
      query.isActive = true;
    } else if (statusFilter === "Expired" || statusFilter === "Inactive") {
      query.isActive = false;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 5);
  const skip = (pageNum - 1) * limitNum;

  const totalCoupons = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    coupons,
    totalCoupons,
    totalPages: Math.ceil(totalCoupons / limitNum) || 1,
    currentPage: pageNum,
    limit: limitNum
  };
};

export const updateCouponRepo = async (id, data) => {
  return Coupon.findByIdAndUpdate(id, data, { new: true });
};

export const findCouponByIdRepo = async (id) => {
  return Coupon.findOne({ _id: id, isDeleted: { $ne: true } });
};

export const deleteCouponRepo = async (id) => {
  return Coupon.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

import Coupon from "../../models/coupon.model.js";

export const findCouponByCode = async (code) => {
  if (!code) return null;
  return Coupon.findOne({
    code: code.toUpperCase()
  });
};

export const createCouponRepo = async (data) => {
  return Coupon.create(data);
};

export const findAllCouponsRepo = async () => {
  return Coupon.find().sort({ createdAt: -1 });
};

export const updateCouponRepo = async (id, data) => {
  return Coupon.findByIdAndUpdate(id, data, { new: true });
};

export const findCouponByIdRepo = async (id) => {
  return Coupon.findById(id);
};

export const deleteCouponRepo = async (id) => {
  return Coupon.findByIdAndDelete(id);
};

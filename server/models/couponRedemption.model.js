import mongoose from "mongoose";

const couponRedemptionSchema = new mongoose.Schema({
  couponId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Coupon",
    required : true
  },
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },
  bookingId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Booking",
    required : true
  },
  discountApplied : {
    type : Number,
    required : true,
    min : 0
  },
  redeemedAt : {
    type : Date,
    default : Date.now
  }
},{timestamps : true})

const CouponRedemption = mongoose.model("CouponRedemption",couponRedemptionSchema)

export default CouponRedemption
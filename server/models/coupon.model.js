import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code : {
    type : String,
    required : true,
    unique : true,
    upperCase : true,
    trim : true
  },
  displayName : {
    type : String,
    trim : true,
    default : ""
  },
  description : {
    type : String,
    trim : true,
    default : ""
  },
  discountType : {
    type : String,
    enum : ["percentage","fixed"],
    required : true
  },
  discountValue : {
    type : Number,
    required : true,
    min : [0, "Discount value cannot be Negative"]
  },
  minPurchaseAmount : {
    type : Number,
    default : 0,
    min : 0
  },
  maxDiscountAmount : {
    type : Number,
    min :0
  },
  startDate : {
    type : Date,
    default : Date.now
  },
  endDate : {
    type : Date,
    required : true
  },
  usagelimit : {
    type : Number,
    required :true,
    min : 1
  },
  perUserLimit : {
    type : Number,
    default : 1,
    min : 1
  },
  usedCount : {
    type : Number,
    default : 0
  },
  applicableEvents : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Event"
  },
  isActive  : {
    type : Boolean,
    default : false
  },
  isPublic : {
    type : Boolean,
    default : true
  },
  isDeleted : {
    type : Boolean,
    default : false
  }
},{timestamps : true})


const Coupon = mongoose.model("Coupon",couponSchema)

export default Coupon
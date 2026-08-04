import mongoose from "mongoose";



export const ticketSchema = new mongoose.Schema({
  ticketId  :{
    type : String,
    required : true,
    unique : true
  },
  qrCodeToken :{
    type : String,
    required : true,
    unique : true
  },
  status : {
    type : String,
    enum :["valid","checked-in","cancelled"],
    default : "valid"
  },
  checkedInAt :{
    type : Date,
    default  : null
  },
  checkedInBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Vendor",
    default : null
  }
})

export const bookingSchema = new mongoose.Schema({
  bookingId : String,

  eventId :{ 
  type : mongoose.Schema.Types.ObjectId,
  ref : "Event",
  required : true
  },

  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },

  tierId :{
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },

  tierName : {
    type : String,
    required : true,
  },

  ticketPrice : {
    type : Number,
    required : true
  },

  quantity : {
    type : Number,
    required : true
  },

  totalAmount :{
    type : Number,
    required : true
  },

  paymentStatus : {
    type : String,
    enum : ["pending","failed","paid","refunded"],
    default : "pending"
  },

  bookingStatus : {
    type : String,
    enum :["pending", "confirmed", "cancelled", "completed"],
    default : "pending"
  },

  couponCode :{
    type : String,
    upperCase : true,
    trim : true
  },
  tickets : [ticketSchema],
  couponDiscount : {
    type : Number,
    default :0 
  },
},{timestamps : true})

const Booking = mongoose.model("Booking",bookingSchema)

export default Booking
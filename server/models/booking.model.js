import mongoose from "mongoose";


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

  qrCode : String,

  paymentStatus : {
    type : String,
    enum : ["pending","failed","paid","refunded"],
    default : "pending"
  },

  bookingStatus : {
    type : String,
    enum :["pending","confirmed","cancelled","checked-in"],
    default : "pending"
  },

  checkedInAt : Date,


},{timestamps : true})

const Booking = mongoose.model("Booking",bookingSchema)

export default Booking
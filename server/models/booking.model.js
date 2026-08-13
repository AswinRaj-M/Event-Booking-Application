import mongoose from "mongoose";



export const ticketSchema = new mongoose.Schema({
  ticketId  :{
    type : String,
    required : true
  },
  qrCodeToken :{
    type : String,
    default: null
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
});

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
    required : false
  },

  tierName : {
    type : String,
    default : "Standard",
  },

  ticketPrice : {
    type : Number,
    required : true,
  },

  quantity : {
    type : Number,
    required : true,
  },

  totalAmount :{
    type : Number,
    required : true,
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

  // Booking-level QR Token and Check-in Tracking
  qrCodeToken: {
    type: String,
    index: true,
    default: null
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null
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
},{timestamps : true});

const Booking = mongoose.model("Booking",bookingSchema);

// Drop legacy unique indexes on subdocuments if they exist in Mongo
Booking.collection?.dropIndex("tickets.qrCodeToken_1").catch(() => {});
Booking.collection?.dropIndex("tickets.ticketId_1").catch(() => {});

export default Booking;
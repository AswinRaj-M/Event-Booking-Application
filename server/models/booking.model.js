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

  originalAmount: {
    type: Number,
    required: false,
  },

  eventDiscount: {
    type: Number,
    default: 0,
  },

  couponDiscount: {
    type: Number,
    default: 0,
  },

  serviceFee: {
    type: Number,
    default: 0,
  },

  totalAmount :{
    type : Number,
    required : true,
  },

  paymentStatus : {
    type : String,
    enum : ["pending","failed","paid","refunded","expired"],
    default : "pending"
  },

  bookingStatus : {
    type : String,
    enum :["pending", "confirmed", "cancelled", "completed", "expired", "failed"],
    default : "pending"
  },

  checkoutExpiresAt: {
    type: Date,
    index: true,
    default: null
  },

  isInventoryReleased: {
    type: Boolean,
    default: false
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
},{timestamps : true});

const Booking = mongoose.model("Booking",bookingSchema);

// Drop legacy unique indexes on subdocuments if they exist in Mongo
Booking.collection?.dropIndex("tickets.qrCodeToken_1").catch(() => {});
Booking.collection?.dropIndex("tickets.ticketId_1").catch(() => {});

export default Booking;
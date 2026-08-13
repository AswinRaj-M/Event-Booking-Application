import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: false
  },
  paymentType: {
    type: String,
    enum: ["booking", "admin-wallet-deposit"],
    default: "booking",
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    default: ""
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "INR",
    uppercase: true
  },
  status: {
    type: String,
    enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED"],
    default: "CREATED"
  },
  paymentMethod: {
    type: String,
    default: "razorpay"
  },
  receipt: {
    type: String,
    default: ""
  },
  signature: {
    type: String,
    default: ""
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;


import mongoose from "mongoose";

const userWalletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ["deposit", "purchase", "refund", "withdrawal"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    balanceAfter: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserWalletTransaction = mongoose.model(
  "UserWalletTransaction",
  userWalletTransactionSchema
);

export default UserWalletTransaction;

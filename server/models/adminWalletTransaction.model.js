import mongoose from "mongoose";

const adminWalletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminWallet",
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ["deposit", "payout", "commission", "adjustment"],
      required: true,
      default: "deposit",
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
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    paymentMethod: {
      type: String,
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      default: "Admin wallet deposit via Razorpay",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const AdminWalletTransaction = mongoose.model(
  "AdminWalletTransaction",
  adminWalletTransactionSchema
);

export default AdminWalletTransaction;

import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
      index: true,
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      required: false,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit", "earnings", "payout", "refund", "withdrawal"],
      default: "earnings",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    description: {
      type: String,
      trim: true,
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

export default WalletTransaction;

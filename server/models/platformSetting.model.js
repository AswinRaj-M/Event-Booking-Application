import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    platformFeePerTicket: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const PlatformSetting = mongoose.model("PlatformSetting", platformSettingSchema);

export default PlatformSetting;

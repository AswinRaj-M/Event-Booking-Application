import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../utils/enums/http.status.enum.js";

//Get shared Razorpay instance initialized with env keys
 
export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new AppError(
      "Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in environment variables",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};


// Verify Razorpay payment signature using HMAC SHA256
 
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new AppError(
      "Razorpay secret key is missing in environment variables",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

import crypto from "crypto";
import Razorpay from "razorpay";
import { 
  createPaymentRepo, 
  findPaymentByRazorpayOrderIdRepo, 
  findPaymentByIdRepo, 
  findPaymentsByUserIdRepo, 
  updatePaymentStatusRepo 
} from "../../repository/user/payment.repo.js";
import { createPendingBookingService, confirmBookingAfterPaymentService } from "./booking.service.js";
import Booking from "../../models/booking.model.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

// Initialize Razorpay Instance
const getRazorpayInstance = () => {
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
    key_secret
  });
};


export const createRazorpayOrderService = async (userId, { eventId, tierId, quantity, couponCode }) => {
  if (!eventId || !quantity || Number(quantity) <= 0) {
    throw new AppError("Valid Event ID and Quantity are required", HTTP_STATUS.BAD_REQUEST);
  }

  // Step A: Create initial pending booking
  const booking = await createPendingBookingService(
    userId,
    eventId,
    tierId,
    Number(quantity),
    couponCode
  );

  if (!booking || booking.totalAmount === undefined || booking.totalAmount === null) {
    throw new AppError("Failed to initiate event booking", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const razorpay = getRazorpayInstance();
  const amountInPaise = Math.round(booking.totalAmount * 100); // Razorpay requires amount in paise
  const receipt = `rcpt_${booking._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;

  const orderOptions = {
    amount: amountInPaise,
    currency: "INR",
    receipt: receipt,
    notes: {
      userId: userId.toString(),
      bookingId: booking._id.toString(),
      eventId: eventId.toString()
    }
  };

  // Step B: Call Razorpay API to generate order
  const razorpayOrder = await razorpay.orders.create(orderOptions);

  if (!razorpayOrder || !razorpayOrder.id) {
    throw new AppError("Razorpay order creation failed", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Step C: Persist Payment record in CREATED status
  const paymentRecord = await createPaymentRepo({
    userId,
    orderId: booking._id,
    razorpayOrderId: razorpayOrder.id,
    amount: booking.totalAmount,
    currency: "INR",
    status: "CREATED",
    receipt: receipt,
    paymentMethod: "razorpay"
  });

  return {
    key: process.env.RAZORPAY_KEY_ID,
    order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    receipt: receipt,
    paymentId: paymentRecord._id,
    bookingId: booking._id,
    checkoutExpiresAt: booking.checkoutExpiresAt,
    expiresInSeconds: booking.checkoutExpiresAt ? Math.max(0, Math.floor((new Date(booking.checkoutExpiresAt).getTime() - Date.now()) / 1000)) : 600,
  };
};

// 2. Verify Payment Signature (Server-side HMAC SHA256)
export const verifyPaymentSignatureService = async (userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("razorpay_order_id, razorpay_payment_id, and razorpay_signature are required", HTTP_STATUS.BAD_REQUEST);
  }

  // Find corresponding payment record
  const payment = await findPaymentByRazorpayOrderIdRepo(razorpay_order_id);

  if (!payment) {
    throw new AppError("Payment record not found for the given order ID", HTTP_STATUS.NOT_FOUND);
  }

  // Security: Check user ownership
  const paymentUserId = payment.userId?._id ? payment.userId._id.toString() : payment.userId.toString();
  if (paymentUserId !== userId.toString()) {
    throw new AppError("Unauthorized payment verification request", HTTP_STATUS.FORBIDDEN);
  }

  // Retrieve Associated Booking
  const bookingId = payment.orderId?._id || payment.orderId;
  const booking = bookingId ? await Booking.findById(bookingId) : null;

  if (!booking) {
    throw new AppError("Associated booking record not found for this payment", HTTP_STATUS.NOT_FOUND);
  }

  // Security: Prevent Duplicate Verification / Replay Attacks
  if (payment.status === "SUCCESS" && booking.bookingStatus === "confirmed") {
    return {
      message: "Payment already verified successfully",
      alreadyVerified: true,
      payment,
      booking
    };
  }

  // EXPIRATION CHECK: Verify that checkout session has not expired
  const now = new Date();
  const isExpired = (booking.checkoutExpiresAt && now > new Date(booking.checkoutExpiresAt)) ||
                    booking.bookingStatus === "expired" ||
                    booking.bookingStatus === "cancelled";

  if (isExpired) {
    // 1. Mark Booking as cancelled and release inventory
    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "failed";
    booking.isInventoryReleased = true;
    await booking.save();

    // 2. Mark Payment as EXPIRED
    await updatePaymentStatusRepo(razorpay_order_id, {
      status: "EXPIRED",
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      notes: { ...payment.notes, expiredCheckout: true, failureReason: "Checkout session expired before payment verification" }
    });

    throw new AppError(
      "Checkout session has expired. Please start a new booking.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // HMAC SHA256 Signature Calculation
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Verify Signature Matches
  if (generatedSignature !== razorpay_signature) {
    // Mark Payment & Booking as FAILED
    await updatePaymentStatusRepo(razorpay_order_id, {
      status: "FAILED",
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    booking.paymentStatus = "failed";
    booking.bookingStatus = "cancelled";
    booking.isInventoryReleased = true;
    await booking.save();

    throw new AppError("Payment signature verification failed. Invalid signature.", HTTP_STATUS.BAD_REQUEST);
  }

  // Signature Valid & Not Expired: Mark Payment as SUCCESS
  const updatedPayment = await updatePaymentStatusRepo(razorpay_order_id, {
    status: "SUCCESS",
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature
  });

  // Confirm booking, update booking status to "confirmed" & "paid", update event capacity/sold count, and generate QR code
  await confirmBookingAfterPaymentService(booking._id);

  return {
    success: true,
    message: "Payment verified successfully",
    payment: updatedPayment,
    bookingId: booking._id
  };
};

/**
 * 3. Handle Payment Cancellation or Failure Recording
 */
export const recordPaymentFailureService = async (userId, { razorpay_order_id, status = "FAILED", reason = "Payment cancelled by user" }) => {
  if (!razorpay_order_id) {
    throw new AppError("razorpay_order_id is required", HTTP_STATUS.BAD_REQUEST);
  }

  const payment = await findPaymentByRazorpayOrderIdRepo(razorpay_order_id);
  if (!payment) {
    throw new AppError("Payment record not found", HTTP_STATUS.NOT_FOUND);
  }

  const updatedStatus = status === "CANCELLED" ? "CANCELLED" : "FAILED";

  const updatedPayment = await updatePaymentStatusRepo(razorpay_order_id, {
    status: updatedStatus
  });

  if (payment.orderId) {
    await Booking.findByIdAndUpdate(payment.orderId._id || payment.orderId, {
      paymentStatus: "failed",
      bookingStatus: "cancelled"
    });
  }

  return {
    success: true,
    message: `Payment status updated to ${updatedStatus}`,
    reason,
    payment: updatedPayment
  };
};

/**
 * 4. Get Payment Details By ID
 */
export const getPaymentByIdService = async (userId, paymentId) => {
  const payment = await findPaymentByIdRepo(paymentId);
  if (!payment) {
    throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND);
  }

  const ownerId = payment.userId._id ? payment.userId._id.toString() : payment.userId.toString();
  if (ownerId !== userId.toString()) {
    throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);
  }

  return payment;
};

/**
 * 5. Get User Payments History
 */
export const getUserPaymentsService = async (userId) => {
  return await findPaymentsByUserIdRepo(userId);
};

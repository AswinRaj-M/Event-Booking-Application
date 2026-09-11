import { AppError } from "../../utils/AppError.js";
import { generateQrToken } from "../../utils/generateQrToken.js";
import { generateTicketNumber } from "../../utils/generateTicketNumber.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import Coupon from "../../models/coupon.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";
import { validateAndApplyCoupon } from "./coupon.service.js";
import CouponRedemption from "../../models/couponRedemption.model.js";
import { generateQRCode } from "../../utils/generateQrCode.js";
import { processVendorBookingEarnings, processVendorBookingRefund } from "../vendor/vendorWallet.service.js";
import { processAdminBookingCommission, processAdminBookingRefund } from "../admin/adminWallet.service.js";
import {
  updateUserWalletBalanceRepo,
  createUserWalletTransactionRepo
} from "../../repository/user/userWallet.repo.js";
import UserWalletTransaction from "../../models/userWalletTransaction.model.js";

import {
  createBookingRepo,
  decrementEventSoldCountRepo,
  findBookingByIdRepo,
  findBookingByTicketRepo,
  findUserBookingsRepo,
  saveBookingRepo,
} from "../../repository/user/booking.repo.js";
import { sendNotification, sendAdminNotification } from "../../config/socket.js";

export const CHECKOUT_EXPIRATION_MINUTES = 10;
export const CHECKOUT_EXPIRATION_MS = CHECKOUT_EXPIRATION_MINUTES * 60 * 1000;

/**
 * Cleanup expired pending bookings and release reserved inventory
 */
export const cleanupExpiredBookingsService = async () => {
  const now = new Date();
  return await Booking.updateMany(
    {
      bookingStatus: "pending",
      checkoutExpiresAt: { $lt: now },
    },
    {
      $set: {
        bookingStatus: "expired",
        paymentStatus: "expired",
        isInventoryReleased: true,
      },
    }
  );
};

export const createPendingBookingService = async (userId, eventId, tierId, quantity, couponCode) => {
   // 1. Clean up any expired pending bookings first
   await cleanupExpiredBookingsService().catch(() => {});

   const event = await Event.findOne({ _id: eventId, isDeleted: false });

   if (!event) {
     throw new AppError("Event not found or is currently unavailable", HTTP_STATUS.NOT_FOUND);
   }

   if (event.isBlocked) {
     throw new AppError("This event is blocked by admin", HTTP_STATUS.FORBIDDEN);
   }

   if (event.eventStatus === "cancelled" || event.eventStatus === "draft" || event.eventStatus === "completed") {
     throw new AppError(`This event is currently ${event.eventStatus} and unavailable for booking`, HTTP_STATUS.BAD_REQUEST);
   }

   let selectedTier = null;
   if (event.ticketType?.toLowerCase() === "free") {
     selectedTier = event.ticketTiers?.[0] ||
       { name: "General Admission", price: 0, capacity: event.totalTickets || 1000, sold: event.soldTickets || 0 };
   } else if (tierId && event.ticketTiers && event.ticketTiers.length > 0) {
     selectedTier = event.ticketTiers.find((tier) => tier._id?.toString() === tierId?.toString());
   }

   if (!selectedTier && event.ticketTiers && event.ticketTiers.length > 0) {
     selectedTier = event.ticketTiers[0];
   }

   if (!selectedTier) {
     selectedTier = {
       _id: new mongoose.Types.ObjectId(),
       name: "Standard",
       price: event.ticketPrice || 0,
       capacity: event.totalTickets || 1000,
       sold: event.soldTickets || 0
     };
   }

   const validTierId = (tierId && mongoose.isValidObjectId(tierId))
     ? new mongoose.Types.ObjectId(tierId)
     : (selectedTier?._id && mongoose.isValidObjectId(selectedTier._id) ? selectedTier._id : new mongoose.Types.ObjectId());

   const tierCapacity = Number(selectedTier?.capacity) || Number(event.totalTickets) || 1000;
   const tierSold = Number(selectedTier?.sold) || Number(event.soldTickets) || 0;

   // 2. Count active non-expired pending reservations so tickets are held during checkout
   const activePending = await Booking.aggregate([
     {
       $match: {
         eventId: new mongoose.Types.ObjectId(eventId),
         tierId: validTierId,
         bookingStatus: "pending",
         checkoutExpiresAt: { $gt: new Date() },
       },
     },
     { $group: { _id: null, totalPending: { $sum: "$quantity" } } },
   ]);
   const pendingHeldTickets = activePending[0]?.totalPending || 0;
   const availableSeats = Math.max(0, tierCapacity - (tierSold + pendingHeldTickets));

   if (availableSeats <= 0 && tierCapacity > 0) {
     throw new AppError("This event or ticket tier is currently sold out or reserved!", HTTP_STATUS.BAD_REQUEST);
   }

   if (quantity > availableSeats && availableSeats > 0) {
     throw new AppError(`Insufficient tickets available! Only ${availableSeats} ticket(s) currently unreserved.`, HTTP_STATUS.BAD_REQUEST);
   }

   const ticketPrice = selectedTier.price || 0;
   const subtotal = ticketPrice * quantity;

   let discountAmount = 0;

   if (event.offer?.enabled && quantity >= (event.offer.minTicketsRequired || 0)) {
     const now = new Date();
     let isOfferValid = true;

     if (event.offer.validFrom) {
       const fromDate = new Date(event.offer.validFrom);
       fromDate.setHours(0, 0, 0, 0);
       if (fromDate > now) isOfferValid = false;
     }
     if (event.offer.validUntil) {
       const untilDate = new Date(event.offer.validUntil);
       untilDate.setHours(23, 59, 59, 999);
       if (untilDate < now) isOfferValid = false;
     }

     if (isOfferValid) {
       discountAmount = (subtotal * (event.offer.discountValue || 0)) / 100;
     }
   }

   const originalAmount = Math.max(0, subtotal - discountAmount);

   let couponDiscount = 0;
   let validatedCoupon = null;

   if (couponCode && couponCode.trim() !== "") {
     const result = await validateAndApplyCoupon(couponCode, userId, eventId, Math.max(subtotal, originalAmount), quantity);
     validatedCoupon = result.coupon;
     couponDiscount = result.discountAmount;
   }

   // Fetch current Platform Fee Per Ticket from DB
   const { getPlatformSettingRepo } = await import("../../repository/admin/platformSetting.repo.js");
   const platformSetting = await getPlatformSettingRepo();
   const isFreeEvent = event.ticketType?.toLowerCase() === "free" || ticketPrice === 0;
   const platformFeePerTicket = isFreeEvent ? 0 : (platformSetting?.platformFeePerTicket ?? 50);
   const totalPlatformFee = platformFeePerTicket * quantity;

   // Total Amount = Vendor Ticket Subtotal (after event discount) - Coupon Discount + Total Platform Fee
   const totalAmount = Math.max(0, originalAmount - couponDiscount + totalPlatformFee);

   // Generate unique bookingId
   const randomSuffix = Math.floor(1000 + Math.random() * 9000);
   const bookingIdString = `BK-${Date.now().toString().slice(-6)}-${randomSuffix}`;

   // 3. Set exact checkout session expiration timestamp (10 minutes)
   const checkoutExpiresAt = new Date(Date.now() + CHECKOUT_EXPIRATION_MS);

   const bookingPayload = {
     bookingId: bookingIdString,
     eventId,
     userId,
     tierId: validTierId,
     tierName: selectedTier.name || "Standard",
     ticketPrice,
     quantity,
     originalAmount,
     eventDiscount: discountAmount,
     couponDiscount,
     platformFee: platformFeePerTicket,
     totalPlatformFee,
     serviceFee: totalPlatformFee,
     totalAmount,
     couponCode: validatedCoupon ? validatedCoupon.code : undefined,
     paymentStatus: "pending",
     bookingStatus: "pending",
     checkoutExpiresAt,
     isInventoryReleased: false,
     qrCodeToken: generateQrToken(),
     tickets: []
   };

   const newBooking = await createBookingRepo(bookingPayload);
   return newBooking;
};


export const getBookingDetailsService = async(userId, userRole, bookingId) => {
  const booking = await findBookingByIdRepo(bookingId);

  if(!booking){
    throw new AppError("Booking Not Found!", HTTP_STATUS.NOT_FOUND);
  }

  // Check and update if pending booking has expired
  if (booking.bookingStatus === "pending" && booking.checkoutExpiresAt && new Date() > new Date(booking.checkoutExpiresAt)) {
    booking.bookingStatus = "expired";
    booking.paymentStatus = "expired";
    booking.isInventoryReleased = true;
    await booking.save();
  }

  const isBooker = booking.userId._id.toString() === userId.toString();
  const isEventOwner = booking.eventId?.vendorId?.toString() === userId.toString();
  const isAdmin = userRole === "admin";

  if(!isBooker && !isEventOwner && !isAdmin){
    throw new AppError("You are not authorized to view this Booking!", HTTP_STATUS.FORBIDDEN);
  }

  // Safe migration for legacy bookings missing booking-level QR token
  if (!booking.qrCodeToken && (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed")) {
    booking.qrCodeToken = booking.tickets?.[0]?.qrCodeToken || generateQrToken();
    await booking.save();
  }

  const bookingObj = booking.toObject();

  // Generate SINGLE booking-level QR Code image
  if (booking.qrCodeToken) {
    bookingObj.qrCodeImage = await generateQRCode(booking.qrCodeToken);
  } else {
    bookingObj.qrCodeImage = null;
  }

  return bookingObj;
};

export const getBookingHistoryService = async(userId) => {
  return await findUserBookingsRepo(userId);
};

export const confirmBookingAfterPaymentService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";

  // Generate exactly ONE booking-level QR token
  if (!booking.qrCodeToken) {
    booking.qrCodeToken = generateQrToken();
  }

  // Generate individual ticket items for tracking ticket quantity and status without separate QR tokens
  if (!booking.tickets || booking.tickets.length === 0) {
    const generatedTickets = [];
    for (let i = 0; i < booking.quantity; i++) {
      generatedTickets.push({
        ticketId: generateTicketNumber(),
        status: "valid",
        checkedInAt: null,
        checkedInBy: null
      });
    }
    booking.tickets = generatedTickets;
  }

  await booking.save();

  try {
    if (booking.tierId) {
      await Event.updateOne(
        { _id: booking.eventId, "ticketTiers._id": booking.tierId },
        { $inc: { soldTickets: booking.quantity, "ticketTiers.$.sold": booking.quantity } }
      );
    } else {
      await Event.updateOne(
        { _id: booking.eventId },
        { $inc: { soldTickets: booking.quantity } }
      );
    }
  } catch (err) {
    console.error("Error updating event sold count on booking confirmation:", err);
  }

  // Credit Vendor Wallet with Net Earnings & Store Wallet Transaction
  let vendorEarningsResult = null;
  try {
    vendorEarningsResult = await processVendorBookingEarnings(booking);
  } catch (err) {
    console.error("Error processing vendor wallet earnings on booking confirmation:", err);
  }

  // Credit Admin Wallet with Platform Fee (and absorb coupon discount)
  try {
    await processAdminBookingCommission(booking);
  } catch (err) {
    console.error("Error processing admin wallet commission on booking confirmation:", err);
  }

  // Consume applied coupon only after successful payment confirmation
  if (booking.couponCode && booking.couponDiscount > 0) {
    try {
      const coupon = await Coupon.findOne({ code: booking.couponCode });
      if (coupon) {
        const existingRedemption = await CouponRedemption.findOne({ bookingId: booking._id });
        if (!existingRedemption) {
          coupon.usedCount += 1;
          await coupon.save();

          await CouponRedemption.create({
            couponId: coupon._id,
            userId: booking.userId,
            bookingId: booking._id,
            discountApplied: booking.couponDiscount
          });
        }
      }
    } catch (couponErr) {
      console.error("Error consuming coupon on payment confirmation:", couponErr);
    }
  }

  // Real-time user & vendor notifications
  try {
    const bookingUserId = booking.userId?._id ? booking.userId._id : booking.userId;
    const populatedEvent = await Event.findById(booking.eventId).populate("vendorId", "_id organizerName businessName");
    const eventTitle = populatedEvent?.title || "Event";
    const vendorId = populatedEvent?.vendorId?._id || populatedEvent?.vendorId;

    // Fetch customer name for vendor notification
    const customer = await User.findById(bookingUserId).select("fullName");
    const customerName = customer?.fullName || "A customer";

    // 1. PAYMENT_SUCCESS to User
    sendNotification(bookingUserId, {
      title: "Payment Successful 💳",
      message: `Payment of ₹${booking.totalAmount.toFixed(2)} for "${eventTitle}" was received successfully.`,
      type: "PAYMENT_SUCCESS"
    });

    // 2. BOOKING_SUCCESS to User
    sendNotification(bookingUserId, {
      title: "Booking Confirmed! 🎉",
      message: `Your booking #${booking.bookingId || booking._id} for "${eventTitle}" has been confirmed.`,
      type: "BOOKING_SUCCESS"
    });

    // 8. NEW_BOOKING to Vendor
    if (vendorId) {
      const vendorTicketAmount = vendorEarningsResult?.earningsData?.netEarnings ?? (
        Number(booking.originalAmount) > 0 
          ? Number(booking.originalAmount) 
          : (Number(booking.ticketPrice || 0) * (Number(booking.quantity) || 1))
      );

      sendNotification(vendorId, {
        title: "New Booking Received! 🎟️",
        message: `${customerName} booked ${booking.quantity} ticket(s) for "${eventTitle}". Ticket Sales Amount: ₹${vendorTicketAmount.toFixed(2)}`,
        type: "NEW_BOOKING"
      });

      // 9. EVENT_SOLD_OUT to Vendor
      if (populatedEvent) {
        const totalCapacity = (populatedEvent.ticketTiers || []).reduce((sum, t) => sum + (t.capacity || 0), 0) || Number(populatedEvent.totalTickets) || 0;
        const totalSold = populatedEvent.soldTickets || 0;

        if (totalCapacity > 0 && totalSold >= totalCapacity) {
          sendNotification(vendorId, {
            title: "Event Sold Out! 🔥",
            message: `Congratulations! "${eventTitle}" is now 100% sold out (${totalSold}/${totalCapacity} tickets).`,
            type: "EVENT_SOLD_OUT"
          });
        } else if (booking.tierId) {
          const bookedTier = (populatedEvent.ticketTiers || []).find((t) => t._id.toString() === booking.tierId.toString());
          if (bookedTier && bookedTier.capacity > 0 && bookedTier.sold >= bookedTier.capacity) {
            sendNotification(vendorId, {
              title: "Ticket Tier Sold Out! 🔥",
              message: `Tier "${bookedTier.name}" for "${eventTitle}" has sold out (${bookedTier.sold}/${bookedTier.capacity} tickets)!`,
              type: "EVENT_SOLD_OUT"
            });
          }
        }
      }
    }

    // Send notification to Admin
    const platformFeeEarned = Number(booking.platformFee) || 0;
    const totalFeeEarned = (booking.quantity || 1) * platformFeeEarned;
    sendAdminNotification({
      title: "New Booking Confirmed 🎟️",
      message: `New booking for "${eventTitle}" (${booking.quantity} ticket(s)). Platform Fee ₹${totalFeeEarned.toFixed(2)} added to Admin wallet.`,
      type: "PAYMENT_SUCCESS"
    });
  } catch (notifErr) {
    console.error("Error sending booking confirmation notifications:", notifErr);
  }

  return booking;
};


export const getUserTicketsService = async(userId) => {
  const bookings = await findUserBookingsRepo(userId);

  const formattedBookings = await Promise.all(
    bookings.map(async(booking) => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;

      // Safe migration for legacy bookings missing booking-level QR token
      let qrToken = bookingObj.qrCodeToken;
      if (!qrToken && (bookingObj.paymentStatus === "paid" || bookingObj.bookingStatus === "confirmed")) {
        qrToken = bookingObj.tickets?.[0]?.qrCodeToken || generateQrToken();
        await Booking.updateOne({ _id: bookingObj._id }, { $set: { qrCodeToken: qrToken } });
      }

      // Generate single booking-level QR code image
      bookingObj.qrCodeImage = qrToken ? await generateQRCode(qrToken) : null;

      return bookingObj;
    })
  );
  return formattedBookings;
};


export const cancelTicketService = async(userId, ticketId, allowedLimitHours = 0) => {
  const booking = await findBookingByTicketRepo(ticketId);
  if (!booking) {
    throw new AppError("Booking Not Found!", HTTP_STATUS.NOT_FOUND);
  }

  const bookingUserId = booking.userId?._id
    ? booking.userId._id.toString()
    : booking.userId?.toString();

  if (bookingUserId && bookingUserId !== userId.toString()) {
    throw new AppError("You are not authorized to cancel this ticket!", HTTP_STATUS.FORBIDDEN);
  }

  const ticket = booking.tickets.find((t) => t.ticketId === ticketId);

  if (!ticket) {
    throw new AppError("Specified ticket not found in Booking", HTTP_STATUS.NOT_FOUND);
  }

  if (ticket.status === "cancelled") {
    return {
      bookingId: booking.bookingId || booking._id,
      ticketId: ticket.ticketId,
      ticketStatus: "cancelled",
      bookingStatus: booking.bookingStatus,
      refundAmount: 0,
      message: "Ticket is already cancelled.",
    };
  }

  if (ticket.status === "checked-in") {
    throw new AppError("Checked-in tickets cannot be cancelled!", HTTP_STATUS.BAD_REQUEST);
  }

  const event = booking.eventId;

  if (event && event.schedule && event.schedule.date) {
    const eventStartDate = new Date(event.schedule.date);
    if (event.schedule.startTime) {
      const timeStr = String(event.schedule.startTime).trim();
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        eventStartDate.setHours(hours, minutes, 0, 0);
      }
    }

    const now = new Date();
    if (allowedLimitHours > 0) {
      const limitInMillis = allowedLimitHours * 60 * 60 * 1000;
      const cancellationDeadLine = new Date(eventStartDate.getTime() - limitInMillis);
      if (!isNaN(cancellationDeadLine.getTime()) && now > cancellationDeadLine) {
        throw new AppError(`Cancellation time limit expired. Tickets can only be cancelled up to ${allowedLimitHours} hours before event start time.`, HTTP_STATUS.BAD_REQUEST);
      }
    }
  }

  // 1. Calculate the exact actual paid refund amount for this ticket
  const isPaidBooking = (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed");
  const totalQuantity = Number(booking.quantity) || (booking.tickets ? booking.tickets.length : 1) || 1;
  const actualPaidAmount = Number(booking.totalAmount) || 0;
  const ticketRefundAmount = (isPaidBooking && actualPaidAmount > 0)
    ? Number((actualPaidAmount / totalQuantity).toFixed(2))
    : 0;

  // 2. Mark ticket as cancelled
  ticket.status = "cancelled";
  ticket.cancelledAt = new Date();

  const allCancelled = booking.tickets.every((t) => t.status === "cancelled");
  if (allCancelled) {
    booking.bookingStatus = "cancelled";
    if (isPaidBooking && actualPaidAmount > 0) {
      booking.paymentStatus = "refunded";
    }
  }

  await saveBookingRepo(booking);

  // 3. Atomically credit User Wallet and create Wallet Transaction (with Idempotency check)
  let userWalletCredited = false;
  let userBalanceAfter = null;

  if (ticketRefundAmount > 0) {
    const existingRefundTx = await UserWalletTransaction.findOne({
      "metadata.ticketId": ticket.ticketId,
      transactionType: "refund",
      status: "completed",
    });

    if (!existingRefundTx) {
      const updatedUser = await updateUserWalletBalanceRepo(userId, ticketRefundAmount);
      userBalanceAfter = updatedUser?.walletBalance || ticketRefundAmount;
      userWalletCredited = true;

      await createUserWalletTransactionRepo({
        userId,
        transactionType: "refund",
        amount: ticketRefundAmount,
        currency: "INR",
        balanceAfter: userBalanceAfter,
        status: "completed",
        paymentMethod: "wallet",
        description: `Ticket cancellation refund for "${event?.title || "Event"}" (${ticket.ticketId})`,
        metadata: {
          bookingId: booking._id,
          bookingCode: booking.bookingId,
          ticketId: ticket.ticketId,
          eventId: event?._id || booking.eventId,
          eventTitle: event?.title || "Event",
          refundAmount: ticketRefundAmount,
        },
      });
    }
  }

  // 4. Process Vendor Wallet Proportional Refund Deduction
  try {
    await processVendorBookingRefund(booking, {
      isPartial: true,
      ticketId: ticket.ticketId,
      cancelledTicketsCount: 1,
      totalQuantity,
    });
  } catch (err) {
    console.error("Error processing vendor wallet refund deduction on ticket cancellation:", err);
  }

  // 5. Process Admin Wallet Commission & Coupon Reversal
  try {
    await processAdminBookingRefund(booking, {
      isPartial: true,
      ticketId: ticket.ticketId,
      cancelledTicketsCount: 1,
      totalQuantity,
    });
  } catch (err) {
    console.error("Error processing admin wallet refund deduction on ticket cancellation:", err);
  }

  // 5. Decrement Event Sold Ticket Count
  try {
    if (event && event._id) {
      await decrementEventSoldCountRepo(event._id, booking.tierId);
    }
  } catch (err) {
    console.error("Error decrementing event sold count:", err);
  }

  // Real-time user notifications
  try {
    const eventTitle = event?.title || "Event";

    // 3. BOOKING_CANCELLED
    sendNotification(userId, {
      title: "Ticket Cancelled ❌",
      message: `Ticket #${ticket.ticketId} for "${eventTitle}" has been cancelled.`,
      type: "BOOKING_CANCELLED",
    });

    if (ticketRefundAmount > 0) {
      // 5. REFUND_COMPLETED
      sendNotification(userId, {
        title: "Refund Added to Wallet 💰",
        message: `₹${ticketRefundAmount.toFixed(2)} refund has been added to your wallet for "${eventTitle}".`,
        type: "REFUND_COMPLETED",
      });
    }

    // Send notification to Admin
    sendAdminNotification({
      title: "Ticket Cancelled ❌",
      message: `Ticket #${ticket.ticketId} for "${eventTitle}" was cancelled by user.`,
      type: "BOOKING_CANCELLED",
    });
  } catch (notifErr) {
    console.error("Error sending ticket cancellation notifications:", notifErr);
  }

  return {
    bookingId: booking.bookingId || booking._id,
    ticketId: ticket.ticketId,
    ticketStatus: ticket.status,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    refundAmount: ticketRefundAmount,
    walletCredited: userWalletCredited,
    newWalletBalance: userBalanceAfter,
    message: ticketRefundAmount > 0 
      ? `Ticket cancelled successfully! ₹${ticketRefundAmount.toFixed(2)} has been credited to your wallet.` 
      : "Ticket cancelled successfully.",
  };
};


// Cancel an entire booking

export const cancelBookingService = async (userId, bookingId, allowedLimitHours = 0) => {
  const booking = await findBookingByIdRepo(bookingId);
  if (!booking) {
    throw new AppError("Booking Not Found!", HTTP_STATUS.NOT_FOUND);
  }

  const bookingUserId = booking.userId?._id
    ? booking.userId._id.toString()
    : booking.userId?.toString();

  if (bookingUserId && bookingUserId !== userId.toString()) {
    throw new AppError("You are not authorized to cancel this booking!", HTTP_STATUS.FORBIDDEN);
  }

  if (booking.bookingStatus === "cancelled") {
    return {
      bookingId: booking.bookingId || booking._id,
      bookingStatus: "cancelled",
      paymentStatus: booking.paymentStatus,
      refundAmount: 0,
      message: "Booking is already cancelled.",
    };
  }

  const unCancelledTickets = (booking.tickets || []).filter((t) => t.status !== "cancelled");
  if (unCancelledTickets.length === 0) {
    return {
      bookingId: booking.bookingId || booking._id,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      refundAmount: 0,
      message: "All tickets for this booking are already cancelled.",
    };
  }

  // Check if any ticket is already checked in
  const hasCheckedIn = unCancelledTickets.some((t) => t.status === "checked-in");
  if (hasCheckedIn) {
    throw new AppError("Bookings with checked-in tickets cannot be cancelled!", HTTP_STATUS.BAD_REQUEST);
  }

  const event = booking.eventId;

  if (event && event.schedule && event.schedule.date) {
    const eventStartDate = new Date(event.schedule.date);
    if (event.schedule.startTime) {
      const timeStr = String(event.schedule.startTime).trim();
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        eventStartDate.setHours(hours, minutes, 0, 0);
      }
    }

    const now = new Date();
    if (allowedLimitHours > 0) {
      const limitInMillis = allowedLimitHours * 60 * 60 * 1000;
      const cancellationDeadLine = new Date(eventStartDate.getTime() - limitInMillis);
      if (!isNaN(cancellationDeadLine.getTime()) && now > cancellationDeadLine) {
        throw new AppError(
          `Cancellation time limit expired. Bookings can only be cancelled up to ${allowedLimitHours} hours before event start time.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
  }

  // 1. Calculate the exact total refund amount for the entire booking
  const isPaidBooking = (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed");
  const totalQuantity = Number(booking.quantity) || (booking.tickets ? booking.tickets.length : 1) || 1;
  const actualPaidAmount = Number(booking.totalAmount) || 0;
  const totalRefundAmount = (isPaidBooking && actualPaidAmount > 0)
    ? Number(((actualPaidAmount * unCancelledTickets.length) / totalQuantity).toFixed(2))
    : 0;

  // 2. Mark all tickets and booking as cancelled
  (booking.tickets || []).forEach((t) => {
    t.status = "cancelled";
    t.cancelledAt = new Date();
  });
  booking.bookingStatus = "cancelled";
  if (isPaidBooking && actualPaidAmount > 0) {
    booking.paymentStatus = "refunded";
  }

  await saveBookingRepo(booking);

  // 3. Atomically credit User Wallet and create EXACTLY ONE Wallet Transaction (with Idempotency check)
  let userWalletCredited = false;
  let userBalanceAfter = null;

  if (totalRefundAmount > 0) {
    const existingRefundTx = await UserWalletTransaction.findOne({
      "metadata.bookingId": booking._id,
      transactionType: "refund",
      status: "completed",
    });

    if (!existingRefundTx) {
      const updatedUser = await updateUserWalletBalanceRepo(userId, totalRefundAmount);
      userBalanceAfter = updatedUser?.walletBalance || totalRefundAmount;
      userWalletCredited = true;

      const bookingCode = booking.bookingId || `BK-${booking._id.toString().slice(-6).toUpperCase()}`;
      await createUserWalletTransactionRepo({
        userId,
        transactionType: "refund",
        amount: totalRefundAmount,
        currency: "INR",
        balanceAfter: userBalanceAfter,
        status: "completed",
        paymentMethod: "wallet",
        description: `Booking Refund - ${bookingCode} ("${event?.title || "Event"}")`,
        metadata: {
          bookingId: booking._id,
          bookingCode,
          eventId: event?._id || booking.eventId,
          eventTitle: event?.title || "Event",
          refundAmount: totalRefundAmount,
          quantity: unCancelledTickets.length,
        },
      });
    }
  }

  // 4. Process Vendor Wallet Refund Deduction
  try {
    await processVendorBookingRefund(booking, {
      isPartial: false,
      cancelledTicketsCount: unCancelledTickets.length,
      totalQuantity,
    });
  } catch (err) {
    console.error("Error processing vendor wallet refund deduction on booking cancellation:", err);
  }

  // 5. Process Admin Wallet Commission & Coupon Reversal
  try {
    await processAdminBookingRefund(booking, {
      isPartial: false,
      cancelledTicketsCount: unCancelledTickets.length,
      totalQuantity,
    });
  } catch (err) {
    console.error("Error processing admin wallet refund deduction on booking cancellation:", err);
  }

  // 5. Decrement Event Sold Ticket Count
  try {
    if (event && event._id) {
      for (let i = 0; i < unCancelledTickets.length; i++) {
        await decrementEventSoldCountRepo(event._id, booking.tierId);
      }
    }
  } catch (err) {
    console.error("Error decrementing event sold count:", err);
  }

  // Real-time user notifications
  try {
    const eventTitle = event?.title || "Event";
    const bookingCode = booking.bookingId || `BK-${booking._id.toString().slice(-6).toUpperCase()}`;

    // 3. BOOKING_CANCELLED
    sendNotification(userId, {
      title: "Booking Cancelled ❌",
      message: `Booking #${bookingCode} for "${eventTitle}" has been cancelled.`,
      type: "BOOKING_CANCELLED",
    });

    if (totalRefundAmount > 0) {
      // 5. REFUND_COMPLETED
      sendNotification(userId, {
        title: "Refund Added to Wallet 💰",
        message: `₹${totalRefundAmount.toFixed(2)} refund has been added to your wallet for "${eventTitle}".`,
        type: "REFUND_COMPLETED",
      });
    }

    // Send notification to Admin
    sendAdminNotification({
      title: "Booking Cancelled ❌",
      message: `Booking #${bookingCode} for "${eventTitle}" was cancelled by user.`,
      type: "BOOKING_CANCELLED",
    });
  } catch (notifErr) {
    console.error("Error sending booking cancellation notifications:", notifErr);
  }

  return {
    bookingId: booking.bookingId || booking._id,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    refundAmount: totalRefundAmount,
    walletCredited: userWalletCredited,
    newWalletBalance: userBalanceAfter,
    message: totalRefundAmount > 0
      ? `Booking cancelled successfully! ₹${totalRefundAmount.toFixed(2)} has been credited to your wallet.`
      : "Booking cancelled successfully.",
  };
};
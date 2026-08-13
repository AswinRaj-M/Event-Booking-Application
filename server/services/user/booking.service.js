import { AppError } from "../../utils/AppError.js";
import { generateQrToken } from "../../utils/generateQrToken.js";
import { generateTicketNumber } from "../../utils/generateTicketNumber.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import Coupon from "../../models/coupon.model.js";
import mongoose from "mongoose";
import { validateAndApplyCoupon } from "./coupon.service.js";
import CouponRedemption from "../../models/couponRedemption.model.js";
import { generateQRCode } from "../../utils/generateQrCode.js";
import { processVendorBookingEarnings, processVendorBookingRefund } from "../vendor/vendorWallet.service.js";

import {
  createBookingRepo,
  decrementEventSoldCountRepo,
  findBookingByIdRepo,
  findBookingByTicketRepo,
  findUserBookingsRepo,
  saveBookingRepo,
} from "../../repository/user/booking.repo.js";

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
        bookingStatus: "cancelled",
        paymentStatus: "failed",
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
     const result = await validateAndApplyCoupon(couponCode, userId, eventId, originalAmount, quantity);
     validatedCoupon = result.coupon;
     couponDiscount = result.discountAmount;
   }

   const serviceFee = event.ticketType === "Free" ? 0 : 14.90;
   const totalAmount = Math.max(0, originalAmount - couponDiscount + serviceFee);

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
     serviceFee,
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
    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "failed";
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
  try {
    await processVendorBookingEarnings(booking);
  } catch (err) {
    console.error("Error processing vendor wallet earnings on booking confirmation:", err);
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

  ticket.status = "cancelled";
  const allCancelled = booking.tickets.every((t) => t.status === "cancelled");
  if (allCancelled) {
    booking.bookingStatus = "cancelled";
  }

  await saveBookingRepo(booking);

  try {
    await processVendorBookingRefund(booking);
  } catch (err) {
    console.error("Error processing vendor wallet refund deduction:", err);
  }

  try {
    if (event && event._id) {
      await decrementEventSoldCountRepo(event._id, booking.tierId);
    }
  } catch (err) {
    console.error("Error decrementing event sold count:", err);
  }

  return {
    bookingId: booking.bookingId || booking._id,
    ticketId: ticket.ticketId,
    ticketStatus: ticket.status,
    bookingStatus: booking.bookingStatus,
  };
};
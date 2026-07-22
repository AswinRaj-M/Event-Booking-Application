import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import mongoose from "mongoose";
import { validateAndApplyCoupon } from "./coupon.service.js";
import CouponRedemption from "../../models/couponRedemption.model.js";

import {
  createBookingRepo,
  findBookingByIdRepo,
  findUserBookingsRepo,
} from "../../repository/user/booking.repo.js";

export const createPendingBookingService = async (userId, eventId, tierId, quantity, couponCode) => {
   const event = await Event.findOne({_id : eventId, isDeleted : false, isBlocked : false})

   if(!event){
    throw new AppError("Event is Not Found or Currently Unavailable!",HTTP_STATUS.NOT_FOUND)
   }


   let selectedTier = null
   if(event.ticketType?.toLowerCase() === "free"){
    selectedTier = event.ticketTiers?.[0] ||
     {name : "General Admmission",price : 0,capacity : event.totalTickets || 100, sold : event.soldTickets ||0}
   }
   else {
    selectedTier = event.ticketTiers.find((tier) => tier._id.toString() === tierId)
   }

   if(!selectedTier){
    throw new AppError("Selected Ticket Tier Does Not Exists!",HTTP_STATUS.BAD_REQUEST)
   }

   const availableSeats = selectedTier.capacity - (selectedTier.sold || 0)

   if(availableSeats < quantity){
    throw new AppError(`Insufficient tickets available!. Only ${availableSeats}`,HTTP_STATUS.BAD_REQUEST)
   }

   const ticketPrice = selectedTier.price || 0
   const subtotal = ticketPrice * quantity

   let discountAmount = 0

   if(event.offer?.enabled && quantity >= (event.offer.minTicketsRequired ||0)){
     const now = new Date()
     let isOfferValid = true

     if(event.offer.validFrom){
       const fromDate = new Date(event.offer.validFrom)
       fromDate.setHours(0, 0, 0, 0)
       if(fromDate > now) isOfferValid = false
     }
     if(event.offer.validUntil){
       const untilDate = new Date(event.offer.validUntil)
       untilDate.setHours(23, 59, 59, 999)
       if(untilDate < now) isOfferValid = false
     }

     if(isOfferValid){
       discountAmount = (subtotal * (event.offer.discountValue) || 0) / 100
     }
    }

   let couponDiscount = 0;
   let validatedCoupon = null;

   if (couponCode && couponCode.trim() !== "") {
     const result = await validateAndApplyCoupon(couponCode, userId, eventId, subtotal);
     validatedCoupon = result.coupon;
     couponDiscount = result.discountAmount;
   }

   const serviceFee = event.ticketType === "Free" ? 0 : 14.90
   const totalAmount = Math.max(0, subtotal - discountAmount - couponDiscount + serviceFee);

   // to generate unique bookingId
   const randomSuffix = Math.floor(1000 + Math.random() * 9000);
   const bookingIdString = `BK-${Date.now().toString().slice(-6)}-${randomSuffix}`;

   const bookingPayload = {
     bookingId: bookingIdString,
     eventId,
     userId,
     tierId: tierId || selectedTier?._id || new mongoose.Types.ObjectId(),
     tierName: selectedTier.name,
     ticketPrice,
     quantity,
     totalAmount,
     couponCode: validatedCoupon ? validatedCoupon.code : undefined,
     couponDiscount: couponDiscount,
     paymentStatus: "pending",
     bookingStatus: "pending"
   };

   const newBooking = await createBookingRepo(bookingPayload);

   if (validatedCoupon) {
     validatedCoupon.usedCount += 1;
     await validatedCoupon.save();

     await CouponRedemption.create({
       couponId: validatedCoupon._id,
       userId: userId,
       bookingId: newBooking._id,
       discountApplied: couponDiscount
     });
   }

   return newBooking;
}


export const getBookingDetailsService = async(userId,userRole,bookingId) =>{
  const booking = await findBookingByIdRepo(bookingId)

  if(!booking){
    throw new AppError("Booking Not Found!",HTTP_STATUS.NOT_FOUND)
  }

  const isBooker = booking.userId._id.toString() === userId.toString()
  const isEventOwner = booking.eventId?.vendorId?.toString() === userId.toString()
  const isAdmin = userRole === "admin"

  if(!isBooker && !isEventOwner && isAdmin){
    throw new AppError("You are not authorized to view this Booking!", HTTP_STATUS.FORBIDDEN)
  }


  return booking
}

export const getBookingHistoryService = async(userId) => {
  return await findUserBookingsRepo(userId);
};

export const confirmBookingAfterPaymentService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  // 54 & 56: Update booking status and payment status to confirmed & paid
  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";

  // Generate QR Code identifier if missing
  if (!booking.qrCode) {
    booking.qrCode = `FESTIVO-TICKET-${booking.bookingId || booking._id}`;
  }

  await booking.save();

  // Increment event sold count and tier capacity
  try {
    const event = await Event.findById(booking.eventId);
    if (event) {
      event.soldTickets = (event.soldTickets || 0) + booking.quantity;

      if (event.ticketTiers && event.ticketTiers.length > 0 && booking.tierId) {
        const tier = event.ticketTiers.find(t => t._id.toString() === booking.tierId.toString());
        if (tier) {
          tier.sold = (tier.sold || 0) + booking.quantity;
        }
      }
      await event.save();
    }
  } catch (err) {
    console.error("Error updating event sold count on booking confirmation:", err);
  }

  return booking;
};

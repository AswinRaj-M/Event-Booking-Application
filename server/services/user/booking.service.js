import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import mongoose from "mongoose";

import {
  createBookingRepo,
  findBookingByIdRepo,
  findUserBookingsRepo,
} from "../../repository/user/booking.repo.js";

export const createPendingBookingService = async (userId,eventId,tierId,quantity)=>{
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

    if(event.offer.validFrom && new Date(event.offer.validFrom) > now) isOfferValid = false
    if(event.offer.validUntil && new Date(event.offer.validUntil < now)) isOfferValid = false

    if(isOfferValid){
      discountAmount = (subtotal * (event.offer.discountValue) || 0) / 100
    }
   }

   const serviceFee = event.ticketType === "Free" ? 0 : 14.90
   const totalAmount = subtotal - discountAmount + serviceFee

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
    paymentStatus: "pending",
    bookingStatus: "pending"
  };

  return await createBookingRepo(bookingPayload)

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
}

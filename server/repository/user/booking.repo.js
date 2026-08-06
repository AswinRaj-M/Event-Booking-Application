import mongoose from "mongoose";
import Booking from "../../models/booking.model.js";

export const createBookingRepo = async(bookingData) =>{
 return await Booking.create(bookingData)
}

export const findBookingByIdRepo = async(bookingId) =>{
  const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
  const query = isObjectId 
    ? { $or: [{ _id: bookingId }, { bookingId: bookingId }] } 
    : { bookingId: bookingId };

  return await Booking.findOne(query)
  .populate({
    path : "eventId",
    select : "title description schedule venue address city thumbnail eventType"
  })
  .populate({
    path : "userId",
    select  : "fullName email phoneNumber"
  })
}


export const findUserBookingsRepo = async(userId) => {
  return await Booking.find({
    userId,
    paymentStatus: { $in: ["paid", "refunded"] }
  })
    .populate({
      path : "eventId",
      select : "title schedule venue city thumbnail eventType category",
      populate: {
        path: "category",
        select: "name"
      }
    })
    .sort({createdAt : -1})
}


export const findBookingByTicketRepo = async(ticketId)=>{
  return await Booking.findOne({"tickets.ticketId" : ticketId})
    .populate("eventId")
    .populate("userId")
}


export const saveBookingRepo = async(bookingDocument)=>{
  return await bookingDocument.save()
}


export const decrementEventSoldCountRepo = async() =>{
   const event = await Event.findById(eventId);
  if (!event) return null;
  if (event.soldTickets && event.soldTickets > 0) {
    event.soldTickets -= 1;
  }
  if (event.ticketTiers && event.ticketTiers.length > 0 && tierId) {
    const tier = event.ticketTiers.find((t) => t._id.toString() === tierId.toString());
    if (tier && tier.sold && tier.sold > 0) {
      tier.sold -= 1;
    }
  }
  return await event.save();
}

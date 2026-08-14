import Booking from "../../models/booking.model.js";
import Event from "../../models/event.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

export const createBookingRepo = async(bookingData) =>{
 return await Booking.create(bookingData)
}

export const findBookingByIdRepo = async(bookingId) =>{
  return await Booking.findById(bookingId)
  .populate({
    path : "eventId",
    select : "title description schedule venue address city thumbnail eventType eventStatus isBlocked cancellationPolicy",
    populate: {
      path: "category",
      select: "name"
    }
  })
  .populate({
    path : "userId",
    select  : "fullName email phoneNumber"
  })
}


export const findUserBookingsRepo = async(userId) => {
  await updateCompletedEvents();

  return await Booking.find({
    userId,
    paymentStatus: { $nin: ["failed", "expired", "pending"] },
    bookingStatus: { $nin: ["failed", "expired", "pending"] },
    $or: [
      { paymentStatus: { $in: ["paid", "refunded", "completed", "success", "SUCCESS", "free"] } },
      { bookingStatus: { $in: ["confirmed", "checked-in", "completed", "cancelled"] } }
    ]
  })
    .populate({
      path : "eventId",
      select : "title schedule venue city thumbnail eventType category eventStatus isBlocked cancellationPolicy",
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


export const decrementEventSoldCountRepo = async(eventId, tierId) => {
  if (!eventId) return null;
  const update = { $inc: { soldTickets: -1 } };
  if (tierId) {
    return await Event.updateOne(
      { _id: eventId, "ticketTiers._id": tierId },
      { $inc: { soldTickets: -1, "ticketTiers.$.sold": -1 } }
    );
  }
  return await Event.findByIdAndUpdate(eventId, update, { new: true });
}

import Booking from "../../models/booking.model.js";

export const createBookingRepo = async(bookingData) =>{
 return await Booking.create(bookingData)
}

export const findBookingByIdRepo = async(bookingId) =>{
  return await Booking.findById(bookingId)
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
  return await Booking.find({userId})
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

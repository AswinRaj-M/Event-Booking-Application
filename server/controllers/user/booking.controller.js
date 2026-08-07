import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  cancelTicketService,
  createPendingBookingService,
  getBookingDetailsService,
  getBookingHistoryService,
  getUserTicketsService,
} from "../../services/user/booking.service.js";
import { AppError } from "../../utils/AppError.js";

export const createBooking = async(req,res) =>{
   const userId = req.user._id
   
   const {eventId , tierId, quantity, couponCode} = req.body

   if(!eventId|| !quantity) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success : false,
      message : "Event ID and Quantity required!"
    })
   }

   const booking = await createPendingBookingService(
    userId,
    eventId,
    tierId,
    Number(quantity),
    couponCode
   )

   return res.status(HTTP_STATUS.CREATED).json({
    success : true,
    message : "Booking initiated successfully in pending state",
    booking
   })
}


export const getBookingDetails = async(req,res) =>{

  const userId = req.user._id
  const userRole = req.user.role
  const {bookingId} = req.params

  const booking = await getBookingDetailsService(userId,userRole,bookingId)


  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : "Booking details fetch Successfully",
    booking
  })
}

export const getBookingHistory =  async(req,res) =>{
  const userId =  req.user._id
    
  const history  = await getBookingHistoryService(userId)


  return res.status(HTTP_STATUS.OK).json({
    success : true,
    messgae : "Fetch Booking History Succesfuly!",
    history
  })
}

export const getUserTickets = async(req,res) =>{
  const userId = req.user.userId
  
  const bookings = await getUserTicketsService(userId)

  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : ' User tickets fetched Successfully!',
    bookings
  })
}


export const cancelTicket = async(req,res) =>{
  const userId = req.user._id || req.user.userId;
  const { ticketId } = req.params;

  if(!ticketId){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message : "Ticket Id required for Cancellation!"
    })
  }

  const result = await cancelTicketService(userId, ticketId);

  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : result.message || "Ticket Cancelled Successfully",
    data : result
  })
}
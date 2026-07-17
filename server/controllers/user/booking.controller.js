import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  createPendingBookingService,
  getBookingDetailsService,
  getBookingHistoryService,
} from "../../services/user/booking.service.js";

export const createBooking = async(req,res) =>{
   const userId = req.user._id
   
   const {eventId , tierId, quantity} = req.body

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
    Number(quantity)
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

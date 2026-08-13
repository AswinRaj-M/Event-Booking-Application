import { 
  findBookingByQrTokenRepo, 
  updateBookingCheckInRepo,
  findVendorRecentCheckInsRepo 
} from "../../repository/vendor/checkIn.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

export const validateAndCheckInBookingService = async (vendorId, qrToken) => {
  if (!qrToken || typeof qrToken !== "string" || !qrToken.trim()) {
    throw new AppError("QR Code token is required for check-in", HTTP_STATUS.BAD_REQUEST);
  }

  const cleanToken = qrToken.trim();
  const booking = await findBookingByQrTokenRepo(cleanToken);

  if (!booking) {
    throw new AppError("Invalid or unrecognized QR Code", HTTP_STATUS.NOT_FOUND);
  }

  // Event validation & ownership
  if (!booking.eventId) {
    throw new AppError("Associated event not found for this ticket", HTTP_STATUS.NOT_FOUND);
  }

  const eventOrganizerId = booking.eventId.vendorId?._id
    ? booking.eventId.vendorId._id.toString()
    : booking.eventId.vendorId?.toString();

  if (eventOrganizerId && eventOrganizerId !== vendorId.toString()) {
    throw new AppError("Unauthorized: This ticket belongs to an event organized by another vendor", HTTP_STATUS.FORBIDDEN);
  }

  // Payment status validation
  const isPaid = booking.paymentStatus === "paid" || booking.paymentStatus === "free" || booking.totalAmount === 0;
  if (!isPaid) {
    throw new AppError(`Payment not completed (Status: ${booking.paymentStatus}). Admission denied.`, HTTP_STATUS.BAD_REQUEST);
  }

  // Booking status validation (cancellation / refunds)
  if (booking.bookingStatus === "cancelled") {
    throw new AppError("This booking was cancelled and refunded. Admission denied.", HTTP_STATUS.BAD_REQUEST);
  }

  // Prevent duplicate check-in
  if (booking.isCheckedIn || (booking.tickets && booking.tickets.length > 0 && booking.tickets.every(t => t.status === "checked-in"))) {
    const checkedInTime = booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString() : "previously";
    throw new AppError(
      `Duplicate Entry Warning: This booking (#${booking.bookingId}) was already checked in on ${checkedInTime}.`,
      HTTP_STATUS.CONFLICT
    );
  }

  // Perform Booking Check-in
  const updatedBooking = await updateBookingCheckInRepo(booking._id, vendorId);

  return {
    success: true,
    message: `Check-in successful! Admitted ${booking.quantity} attendee(s).`,
    admittedCount: booking.quantity,
    booking: {
      id: updatedBooking._id,
      bookingId: updatedBooking.bookingId || updatedBooking._id,
      eventTitle: updatedBooking.eventId.title,
      eventType: updatedBooking.eventId.eventType,
      venue: updatedBooking.eventId.venue,
      city: updatedBooking.eventId.city,
      tierName: updatedBooking.tierName,
      quantity: updatedBooking.quantity,
      ticketPrice: updatedBooking.ticketPrice,
      totalAmount: updatedBooking.totalAmount,
      attendeeName: updatedBooking.userId?.fullName || "Guest",
      attendeeEmail: updatedBooking.userId?.email || "N/A",
      attendeePhone: updatedBooking.userId?.phoneNumber || "N/A",
      checkedInAt: updatedBooking.checkedInAt,
      tickets: updatedBooking.tickets
    }
  };
};

export const getVendorRecentCheckInsService = async (vendorId) => {
  return await findVendorRecentCheckInsRepo(vendorId);
};

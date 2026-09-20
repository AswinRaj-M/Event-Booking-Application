import { 
  findBookingByQrTokenRepo, 
  updateBookingCheckInRepo,
  findVendorRecentCheckInsRepo 
} from "../../repository/vendor/checkIn.repo.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { sendNotification } from "../../config/socket.js";

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

  // Check if specific scanned tier ticket was already checked in
  const targetTicket = booking.tickets?.find(t => t.qrCodeToken === cleanToken);
  if (targetTicket && targetTicket.status === "checked-in") {
    const checkedInTime = targetTicket.checkedInAt ? new Date(targetTicket.checkedInAt).toLocaleString() : "previously";
    throw new AppError(
      `Duplicate Entry Warning: The "${targetTicket.tierName}" tier pass for booking (#${booking.bookingId}) was already checked in on ${checkedInTime}.`,
      HTTP_STATUS.CONFLICT
    );
  }

  // Prevent duplicate check-in for full booking
  if (booking.isCheckedIn || (booking.tickets && booking.tickets.length > 0 && booking.tickets.every(t => t.status === "checked-in"))) {
    const checkedInTime = booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString() : "previously";
    throw new AppError(
      `Duplicate Entry Warning: This booking (#${booking.bookingId}) was already checked in on ${checkedInTime}.`,
      HTTP_STATUS.CONFLICT
    );
  }

  // Perform Tier / Booking Check-in
  const { booking: updatedBooking, matchedTicket } = await updateBookingCheckInRepo(booking._id, vendorId, cleanToken);
  const admittedTier = matchedTicket || targetTicket || (updatedBooking.tickets?.[0]);
  const admittedQuantity = admittedTier?.quantity || updatedBooking.quantity;
  const admittedTierName = admittedTier?.tierName || updatedBooking.tierName;

  // TICKET_CHECKED_IN notification
  try {
    const attendeeUserId = updatedBooking.userId?._id ? updatedBooking.userId._id : updatedBooking.userId;
    if (attendeeUserId) {
      sendNotification(attendeeUserId, {
        title: "Ticket Checked-In 🎟️",
        message: `Your ${admittedTierName} pass (${admittedQuantity} ticket(s)) for "${updatedBooking.eventId?.title || "Event"}" has been checked in successfully. Enjoy the event!`,
        type: "TICKET_CHECKED_IN",
      });
    }
  } catch (notifErr) {
    console.error("Failed to send check-in notification:", notifErr);
  }

  return {
    success: true,
    message: `Check-in successful! Admitted ${admittedQuantity} attendee(s) for "${admittedTierName}" tier.`,
    admittedCount: admittedQuantity,
    booking: {
      id: updatedBooking._id,
      bookingId: updatedBooking.bookingId || updatedBooking._id,
      eventTitle: updatedBooking.eventId?.title,
      eventType: updatedBooking.eventId?.eventType,
      venue: updatedBooking.eventId?.venue,
      city: updatedBooking.eventId?.city,
      tierName: admittedTierName,
      quantity: admittedQuantity,
      ticketPrice: admittedTier?.ticketPrice || updatedBooking.ticketPrice,
      totalAmount: updatedBooking.totalAmount,
      attendeeName: updatedBooking.userId?.fullName || "Guest",
      attendeeEmail: updatedBooking.userId?.email || "N/A",
      attendeePhone: updatedBooking.userId?.phoneNumber || "N/A",
      checkedInAt: admittedTier?.checkedInAt || updatedBooking.checkedInAt,
      tickets: updatedBooking.tickets
    }
  };
};

export const getVendorRecentCheckInsService = async (vendorId) => {
  return await findVendorRecentCheckInsRepo(vendorId);
};

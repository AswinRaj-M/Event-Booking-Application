import Booking from "../../models/booking.model.js";

export const findBookingByQrTokenRepo = async (qrToken) => {
  if (!qrToken) return null;
  return await Booking.findOne({
    $or: [
      { qrCodeToken: qrToken },
      { "tickets.qrCodeToken": qrToken },
      { bookingId: qrToken }
    ]
  })
    .populate({
      path: "eventId",
      select: "title schedule venue address city thumbnail eventType eventStatus vendorId isBlocked"
    })
    .populate({
      path: "userId",
      select: "fullName email phoneNumber profilePicture"
    });
};

export const updateBookingCheckInRepo = async (bookingId, vendorId, targetQrToken) => {
  const checkInDate = new Date();

  const booking = await Booking.findById(bookingId)
    .populate({
      path: "eventId",
      select: "title schedule venue address city thumbnail eventType eventStatus vendorId"
    })
    .populate({
      path: "userId",
      select: "fullName email phoneNumber profilePicture"
    });

  if (!booking) return null;

  let matchedTicket = null;

  if (targetQrToken && booking.tickets && booking.tickets.length > 0) {
    matchedTicket = booking.tickets.find(t => t.qrCodeToken === targetQrToken || t.ticketId === targetQrToken);
  }

  if (matchedTicket) {
    matchedTicket.status = "checked-in";
    matchedTicket.checkedInAt = checkInDate;
    matchedTicket.checkedInBy = vendorId;
  } else if (booking.tickets && booking.tickets.length > 0) {
    booking.tickets.forEach(ticket => {
      if (ticket.status !== "cancelled") {
        ticket.status = "checked-in";
        ticket.checkedInAt = checkInDate;
        ticket.checkedInBy = vendorId;
      }
    });
  }

  const allCheckedIn = booking.tickets && booking.tickets.length > 0
    && booking.tickets.every(t => t.status === "checked-in" || t.status === "cancelled");

  if (allCheckedIn || !booking.tickets || booking.tickets.length === 0) {
    booking.isCheckedIn = true;
    booking.checkedInAt = checkInDate;
    booking.checkedInBy = vendorId;
  }

  await booking.save();
  return { booking, matchedTicket };
};

export const findVendorRecentCheckInsRepo = async (vendorId, limit = 20) => {
  return await Booking.find({
    checkedInBy: vendorId,
    isCheckedIn: true
  })
    .populate({
      path: "eventId",
      select: "title schedule venue city thumbnail"
    })
    .populate({
      path: "userId",
      select: "fullName email phoneNumber"
    })
    .sort({ checkedInAt: -1 })
    .limit(limit);
};

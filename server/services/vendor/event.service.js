import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import { processVendorBookingRefund } from "./vendorWallet.service.js";
import {
  updateUserWalletBalanceRepo,
  createUserWalletTransactionRepo
} from "../../repository/user/userWallet.repo.js";
import UserWalletTransaction from "../../models/userWalletTransaction.model.js";

import {
  createEventRepo,
  getVendorEventsRepo,
  cancelEventRepo,
  updateEventRepo,
  deleteEventRepo,
} from "../../repository/vendor/event.repo.js";
import { sendNotification, sendAdminNotification } from "../../config/socket.js";

const validateOfferDates = (offerEnabled, validFrom, validUntil, eventDate) => {
  const isEnabled = offerEnabled === "true" || offerEnabled === true;
  if (!isEnabled) return;

  if (!validFrom || !validUntil) {
    throw new AppError("Offer validFrom and validUntil dates are required when offer is enabled", HTTP_STATUS.BAD_REQUEST);
  }

  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
    throw new AppError("Invalid offer dates provided", HTTP_STATUS.BAD_REQUEST);
  }

  const fromDateOnly = new Date(fromDate);
  fromDateOnly.setHours(0, 0, 0, 0);
  const untilDateOnly = new Date(untilDate);
  untilDateOnly.setHours(0, 0, 0, 0);

  if (fromDateOnly < today) {
    throw new AppError("Offer Start Date cannot be in the past", HTTP_STATUS.BAD_REQUEST);
  }

  if (untilDateOnly < today) {
    throw new AppError("Offer End Date cannot be in the past", HTTP_STATUS.BAD_REQUEST);
  }

  if (untilDateOnly <= fromDateOnly) {
    throw new AppError("Offer End Date must be after Offer Start Date", HTTP_STATUS.BAD_REQUEST);
  }

  if (eventDate) {
    const eventDateObj = new Date(eventDate);
    if (!isNaN(eventDateObj.getTime())) {
      const eventDateOnly = new Date(eventDateObj);
      eventDateOnly.setHours(0, 0, 0, 0);
      if (untilDateOnly > eventDateOnly) {
        throw new AppError("Offer End Date cannot be set after the event date / event end date", HTTP_STATUS.BAD_REQUEST);
      }
    }
  }
};

const parseEventDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const parts = typeof timeStr === 'string' ? timeStr.trim().split(/\s+/) : [];
  const timePart = parts[0];
  const modifier = parts[1]; // AM or PM
  
  let hours = 0;
  let minutes = 0;
  if (timePart) {
    const timeComponents = timePart.split(':');
    let h = parseInt(timeComponents[0], 10);
    let m = parseInt(timeComponents[1] || '0', 10);
    if (!isNaN(h) && !isNaN(m)) {
      if (modifier) {
        const mod = modifier.toUpperCase();
        if (mod === 'PM' && h < 12) h += 12;
        if (mod === 'AM' && h === 12) h = 0;
      }
      hours = h;
      minutes = m;
    }
  }

  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const dateParts = dateStr.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day, hours, minutes, 0, 0);
      }
    }
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
  }
  return null;
};

export const createEventService = async(data)=>{
  const rawDate = data.date || data.schedule?.date;
  const rawStartTime = data.startTime || data.schedule?.startTime;
  let parsedDate = undefined;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
    }
  }

  if (rawDate) {
    const startDateTime = parseEventDateTime(rawDate, rawStartTime);
    const now = new Date();
    if (startDateTime && startDateTime <= now) {
      throw new AppError("Event start time must be in the future", HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  validateOfferDates(data.offerEnabled, data.validFrom, data.validUntil, parsedDate || rawDate);

  let ticketTiers = data.ticketTiers;
  if (data.ticketType === "Free") {
    ticketTiers = [{
      name: "General Admission",
      price: 0,
      capacity: Number(data.totalTickets) || 100,
      sold: 0,
      benefits: ["General Entry"]
    }];
  } else if (data.ticketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
    ticketTiers = [{
      name: "General Admission",
      price: Number(data.ticketPrice) || 0,
      capacity: Number(data.totalTickets) || 100,
      sold: 0,
      benefits: ["General Admission Entry"]
    }];
  } else if (Array.isArray(ticketTiers)) {
    ticketTiers = ticketTiers.filter(tier => {
      const hasName = tier.name && tier.name.trim() !== '';
      const hasPrice = tier.price !== undefined && tier.price !== null;
      const hasCapacity = tier.capacity !== undefined && tier.capacity !== null && tier.capacity !== 0;
      const hasBenefits = Array.isArray(tier.benefits) && tier.benefits.length > 0;
      return hasName || hasPrice || hasCapacity || hasBenefits;
    });
  }

  const event = await createEventRepo({
    title : data.title,
    description : data.description,
    category : data.category || undefined,
    
    vendorId : data.vendorId,

    eventType : data.eventType || undefined,
    onlineLink : data.onlineLink || "",
    thumbnail : data.thumbnail,
    images : data.images,

    schedule : {
      date : parsedDate,
      startTime : data.startTime || data.schedule?.startTime || undefined,
      endTime : data.endTime || data.schedule?.endTime || undefined
    },

    venue : data.venue,
    address : data.address,
    city : data.city,
    state : data.state,

    location : {
      latitude : Number(data.latitude) || undefined,
      longitude : Number(data.longitude) || undefined
    },

    ageRestriction :{
      enabled : data.ageRestriction === "true" || data.ageRestriction === true,
      minAge : 18,
    },

    ticketType : data.ticketType,
    ticketTiers : ticketTiers,
    maxTicketPerPerson : Number(data.maxTicketPerPerson) || undefined,
    eventStatus : data.eventStatus || "pending",


    offer : {
      enabled  : data.offerEnabled === "true" || data.offerEnabled === true,
      discountValue : Number(data.discountValue) || 0 ,
      minTicketsRequired : Number(data.minTicketsRequired) || 0,
      validFrom : data.validFrom ? new Date(data.validFrom) : undefined,
      validUntil : data.validUntil ? new Date(data.validUntil) : undefined
    }
  });

  // Send notification to Admin
  sendAdminNotification({
    title: "New Event Created 📅",
    message: `New event "${event.title}" created. Status: ${event.eventStatus}`,
    type: "NEW_BOOKING"
  }).catch(() => {});

  return event;
};

export const getVendorEventsService = async (vendorId) => {
  const events = await getVendorEventsRepo(vendorId);
  const eventIds = events.map(e => e._id);

  const bookingCounts = await Booking.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        bookingStatus: { $in: ["confirmed", "completed"] },
        paymentStatus: { $in: ["paid", "free", "completed", "success", "SUCCESS"] }
      }
    },
    {
      $group: {
        _id: "$eventId",
        totalSold: { $sum: "$quantity" }
      }
    }
  ]);

  const bookingCountMap = {};
  bookingCounts.forEach(b => {
    bookingCountMap[b._id.toString()] = b.totalSold;
  });

  return events.map((event) => {
    const totalTickets = (event.ticketTiers || []).reduce(
      (sum, tier) => sum + (tier.capacity || 0), 0
    );
    const tierSoldSum = (event.ticketTiers || []).reduce(
      (sum, tier) => sum + (tier.sold || 0), 0
    );
    const actualSold = bookingCountMap[event._id.toString()] !== undefined
      ? bookingCountMap[event._id.toString()]
      : (event.soldTickets !== undefined && event.soldTickets > 0 ? event.soldTickets : tierSoldSum);

    return {
      ...event.toObject(),
      totalTickets,
      soldTickets: actualSold
    };
  });
};

export const cancelEventService = async (eventId, vendorId) => {
  const event = await Event.findOne({ _id: eventId, vendorId });
  if (!event) {
    throw new AppError("Event not found or unauthorized", HTTP_STATUS.NOT_FOUND);
  }
  if (event.eventStatus === "cancelled") {
    throw new AppError("Event is already cancelled", HTTP_STATUS.BAD_REQUEST);
  }

  // Handle all existing paid/confirmed bookings safely
  const paidBookings = await Booking.find({
    eventId: eventId,
    bookingStatus: { $in: ["confirmed", "completed"] },
    paymentStatus: "paid"
  });

  let refundedCount = 0;
  for (const booking of paidBookings) {
    try {
      // 1. Process vendor wallet deduction
      await processVendorBookingRefund(booking);

      // 2. Calculate remaining uncancelled tickets refund amount
      const uncancelledTickets = (booking.tickets || []).filter(t => t.status !== "cancelled");
      const uncancelledCount = uncancelledTickets.length > 0 ? uncancelledTickets.length : (booking.quantity || 1);
      const totalTickets = Number(booking.quantity) || (booking.tickets ? booking.tickets.length : 1) || 1;
      const refundAmount = Number(((Number(booking.totalAmount) || 0) * (uncancelledCount / totalTickets)).toFixed(2));

      // 3. Mark all tickets and booking as cancelled & refunded
      (booking.tickets || []).forEach(t => { 
        t.status = "cancelled";
        t.cancelledAt = new Date();
      });
      booking.bookingStatus = "cancelled";
      booking.paymentStatus = "refunded";
      await booking.save();

      // 4. Atomically credit User Wallet and create Wallet Transaction (with Idempotency check)
      if (refundAmount > 0 && booking.userId) {
        const bookingUserId = booking.userId?._id ? booking.userId._id : booking.userId;
        const existingUserRefund = await UserWalletTransaction.findOne({
          "metadata.bookingId": booking._id,
          "metadata.eventCancellation": true,
          transactionType: "refund",
          status: "completed"
        });

        if (!existingUserRefund) {
          const updatedUser = await updateUserWalletBalanceRepo(bookingUserId, refundAmount);
          await createUserWalletTransactionRepo({
            userId: bookingUserId,
            transactionType: "refund",
            amount: refundAmount,
            currency: "INR",
            balanceAfter: updatedUser?.walletBalance || refundAmount,
            status: "completed",
            paymentMethod: "wallet",
            description: `Event cancellation automatic refund for "${event.title}"`,
            metadata: {
              bookingId: booking._id,
              bookingCode: booking.bookingId,
              eventId: event._id,
              eventTitle: event.title,
              eventCancellation: true,
              refundAmount
            }
          });
        }

        // Real-time user notifications on event cancellation
        try {
          // 6. EVENT_CANCELLED
          sendNotification(bookingUserId, {
            title: "Event Cancelled ⚠️",
            message: `The event "${event.title}" has been cancelled by the host.`,
            type: "EVENT_CANCELLED",
          });

          // 5. REFUND_COMPLETED
          if (refundAmount > 0) {
            sendNotification(bookingUserId, {
              title: "Refund Added to Wallet 💰",
              message: `₹${refundAmount.toFixed(2)} refund has been added to your wallet for "${event.title}".`,
              type: "REFUND_COMPLETED",
            });
          }
        } catch (notifErr) {
          console.error(`Failed to notify user ${bookingUserId} of event cancellation:`, notifErr);
        }
      }

      refundedCount++;
    } catch (refundErr) {
      console.error(`Refund failed for booking ${booking._id} on event cancellation:`, refundErr);
    }
  }

  const cancelledEvent = await cancelEventRepo(eventId, vendorId);

  // Send notification to Admin
  sendAdminNotification({
    title: "Event Cancelled by Vendor ⚠️",
    message: `Vendor cancelled event "${event.title}". Refunds processed for all attendees.`,
    type: "EVENT_CANCELLED"
  }).catch(() => {});

  return {
    event: cancelledEvent,
    refundedBookingsCount: refundedCount
  };
};

export const updateEventService = async (eventId, vendorId, data) => {
  const existingEvent = await Event.findOne({ _id: eventId, vendorId });
  if (!existingEvent) {
    throw new AppError("Event not found or unauthorized", HTTP_STATUS.NOT_FOUND);
  }

  const updateData = {};

  if (data.title !== undefined && data.title !== '') updateData.title = data.title;
  if (data.description !== undefined && data.description !== '') updateData.description = data.description;
  if (data.category !== undefined && data.category !== '') updateData.category = data.category;
  if (data.eventType !== undefined && data.eventType !== '') updateData.eventType = data.eventType;
  if (data.onlineLink !== undefined) updateData.onlineLink = data.onlineLink;
  if (data.venue !== undefined && data.venue !== '') updateData.venue = data.venue;
  if (data.address !== undefined && data.address !== '') updateData.address = data.address;
  if (data.city !== undefined && data.city !== '') updateData.city = data.city;
  if (data.state !== undefined && data.state !== '') updateData.state = data.state;
  if (data.ticketType !== undefined && data.ticketType !== '') updateData.ticketType = data.ticketType;
  if (data.maxTicketPerPerson !== undefined && data.maxTicketPerPerson !== '') updateData.maxTicketPerPerson = Number(data.maxTicketPerPerson);
  if (data.eventStatus !== undefined && data.eventStatus !== '') updateData.eventStatus = data.eventStatus;

  if (data.latitude !== undefined || data.longitude !== undefined) {
    updateData.location = {
      latitude: data.latitude !== undefined && data.latitude !== '' ? Number(data.latitude) : existingEvent.location?.latitude,
      longitude: data.longitude !== undefined && data.longitude !== '' ? Number(data.longitude) : existingEvent.location?.longitude
    };
  }

  if (data.ageRestriction !== undefined) {
    updateData.ageRestriction = {
      enabled: data.ageRestriction === "true" || data.ageRestriction === true,
      minAge: 18
    };
  }

  // Handle schedule safely: preserve existing values if not provided
  const rawDate = data.date !== undefined && data.date !== '' 
    ? data.date 
    : (data.schedule?.date !== undefined && data.schedule?.date !== '' ? data.schedule.date : undefined);
  const rawStartTime = data.startTime !== undefined && data.startTime !== '' 
    ? data.startTime 
    : (data.schedule?.startTime !== undefined && data.schedule?.startTime !== '' ? data.schedule.startTime : undefined);
  const rawEndTime = data.endTime !== undefined && data.endTime !== '' 
    ? data.endTime 
    : (data.schedule?.endTime !== undefined && data.schedule?.endTime !== '' ? data.schedule.endTime : undefined);

  if (rawDate !== undefined || rawStartTime !== undefined || rawEndTime !== undefined) {
    let finalDate = existingEvent.schedule?.date;
    if (rawDate !== undefined) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        finalDate = parsedDate;
      }
    }

    const effectiveDate = rawDate !== undefined ? rawDate : existingEvent.schedule?.date;
    const effectiveStartTime = rawStartTime !== undefined ? rawStartTime : existingEvent.schedule?.startTime;
    if (effectiveDate) {
      const startDateTime = parseEventDateTime(effectiveDate, effectiveStartTime);
      const now = new Date();
      if (startDateTime && startDateTime <= now) {
        throw new AppError("Event start time must be in the future", HTTP_STATUS.BAD_REQUEST);
      }
    }

    updateData.schedule = {
      date: finalDate,
      startTime: rawStartTime !== undefined ? rawStartTime : existingEvent.schedule?.startTime,
      endTime: rawEndTime !== undefined ? rawEndTime : existingEvent.schedule?.endTime
    };
  }

  // Aggregate confirmed / completed bookings count for this specific event by tierId
  const tierBookingCounts = await Booking.aggregate([
    {
      $match: {
        eventId: existingEvent._id,
        bookingStatus: { $in: ["confirmed", "completed"] },
        paymentStatus: { $in: ["paid", "free", "completed", "success", "SUCCESS"] }
      }
    },
    {
      $group: {
        _id: "$tierId",
        totalSold: { $sum: "$quantity" }
      }
    }
  ]);
  const tierSoldMap = {};
  let totalConfirmedSold = 0;
  tierBookingCounts.forEach(b => {
    if (b._id) tierSoldMap[b._id.toString()] = b.totalSold;
    totalConfirmedSold += b.totalSold;
  });

  // Handle ticket tiers:
  if (data.ticketTiers !== undefined || data.ticketType !== undefined || data.totalTickets !== undefined || data.ticketPrice !== undefined) {
    let ticketTiers = data.ticketTiers;
    const effectiveTicketType = data.ticketType || existingEvent.ticketType;

    if (effectiveTicketType === "Free") {
      let soldVal = totalConfirmedSold || existingEvent.soldTickets || 0;
      if (existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
        soldVal = Math.max(soldVal, existingEvent.ticketTiers[0].sold || 0);
      }
      ticketTiers = [{
        _id: existingEvent.ticketTiers?.[0]?._id || new mongoose.Types.ObjectId(),
        name: "General Admission",
        price: 0,
        capacity: Number(data.totalTickets) || existingEvent.totalTickets || 100,
        sold: soldVal,
        benefits: ["General Entry"]
      }];
    } else if (effectiveTicketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
      let soldVal = totalConfirmedSold || existingEvent.soldTickets || 0;
      if (existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
        soldVal = Math.max(soldVal, existingEvent.ticketTiers[0].sold || 0);
      }
      ticketTiers = [{
        _id: existingEvent.ticketTiers?.[0]?._id || new mongoose.Types.ObjectId(),
        name: "General Admission",
        price: Number(data.ticketPrice) || existingEvent.ticketPrice || 0,
        capacity: Number(data.totalTickets) || existingEvent.totalTickets || 100,
        sold: soldVal,
        benefits: ["General Admission Entry"]
      }];
    } else if (Array.isArray(ticketTiers)) {
      ticketTiers = ticketTiers.filter(tier => {
        const hasName = tier.name && tier.name.trim() !== '';
        const hasPrice = tier.price !== undefined && tier.price !== null;
        const hasCapacity = tier.capacity !== undefined && tier.capacity !== null && tier.capacity !== 0;
        const hasBenefits = Array.isArray(tier.benefits) && tier.benefits.length > 0;
        return hasName || hasPrice || hasCapacity || hasBenefits;
      });

      if (existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
        ticketTiers = ticketTiers.map((tier, idx) => {
          const oldTier = (tier._id && existingEvent.ticketTiers.find(t => t._id?.toString() === tier._id?.toString()))
            || existingEvent.ticketTiers[idx]
            || existingEvent.ticketTiers.find(t => t.name?.toLowerCase() === tier.name?.toLowerCase());

          const tierId = oldTier ? oldTier._id : (tier._id ? new mongoose.Types.ObjectId(tier._id) : new mongoose.Types.ObjectId());
          const actualSold = (tierId && tierSoldMap[tierId.toString()] !== undefined)
            ? tierSoldMap[tierId.toString()]
            : (oldTier ? (oldTier.sold || 0) : (tier.sold || 0));

          return {
            ...tier,
            _id: tierId,
            sold: actualSold
          };
        });
      }
    }

    if (ticketTiers) {
      updateData.ticketTiers = ticketTiers;
      const totalCapacity = ticketTiers.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
      const totalSold = ticketTiers.reduce((sum, t) => sum + (Number(t.sold) || 0), 0);
      updateData.totalTickets = totalCapacity;
      updateData.soldTickets = Math.max(totalSold, totalConfirmedSold, existingEvent.soldTickets || 0);
      if (data.ticketPrice !== undefined && data.ticketPrice !== '') updateData.ticketPrice = Number(data.ticketPrice);
    }
  } else {
    const totalCapacity = (existingEvent.ticketTiers || []).reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
    const totalSold = (existingEvent.ticketTiers || []).reduce((sum, t) => sum + (Number(t.sold) || 0), 0);
    updateData.totalTickets = totalCapacity;
    updateData.soldTickets = Math.max(totalSold, totalConfirmedSold, existingEvent.soldTickets || 0);
  }

  if (data.offerEnabled !== undefined) {
    const offerEnabled = data.offerEnabled === "true" || data.offerEnabled === true;
    if (offerEnabled) {
      const effectiveEventDate = updateData.schedule?.date || existingEvent.schedule?.date || rawDate;
      validateOfferDates(data.offerEnabled, data.validFrom, data.validUntil, effectiveEventDate);
    }
    updateData.offer = {
      enabled: offerEnabled,
      discountValue: Number(data.discountValue) || 0,
      minTicketsRequired: Number(data.minTicketsRequired) || 0,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined
    };
  }

  if (data.thumbnail) {
    updateData.thumbnail = data.thumbnail;
  }

  if (data.images !== undefined) {
    updateData.images = data.images;
  }

  const updatedDoc = await updateEventRepo(eventId, vendorId, updateData);
  if (!updatedDoc) return null;

  const totalCapacity = (updatedDoc.ticketTiers || []).reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
  const totalSold = (updatedDoc.ticketTiers || []).reduce((sum, t) => sum + (Number(t.sold) || 0), 0);

  return {
    ...updatedDoc.toObject(),
    totalTickets: totalCapacity || updatedDoc.totalTickets || 0,
    soldTickets: Math.max(totalSold, totalConfirmedSold, updatedDoc.soldTickets || 0)
  };
};

export const deleteEventService = async (eventId, vendorId) => {
  return await deleteEventRepo(eventId, vendorId);
};

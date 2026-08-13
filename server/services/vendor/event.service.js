import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import Event from "../../models/event.model.js";
import Booking from "../../models/booking.model.js";
import { processVendorBookingRefund } from "./vendorWallet.service.js";

import {
  createEventRepo,
  getVendorEventsRepo,
  cancelEventRepo,
  updateEventRepo,
  deleteEventRepo,
} from "../../repository/vendor/event.repo.js";

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

export const createEventService = async(data)=>{
  const rawDate = data.date || data.schedule?.date;
  let parsedDate = undefined;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
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

  return event;
};

export const getVendorEventsService = async (vendorId) => {
  const events = await getVendorEventsRepo(vendorId);
  return events.map((event) => {
    const totalTickets = (event.ticketTiers || []).reduce(
      (sum, tier) => sum + (tier.capacity || 0), 0
    );
    const soldTickets = event.soldTickets || (event.ticketTiers || []).reduce(
      (sum, tier) => sum + (tier.sold || 0), 0
    );

    return {
      ...event.toObject(),
      totalTickets,
      soldTickets
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
      await processVendorBookingRefund(booking);
      refundedCount++;
    } catch (refundErr) {
      console.error(`Refund failed for booking ${booking._id} on event cancellation:`, refundErr);
    }
  }

  const cancelledEvent = await cancelEventRepo(eventId, vendorId);

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

    updateData.schedule = {
      date: finalDate,
      startTime: rawStartTime !== undefined ? rawStartTime : existingEvent.schedule?.startTime,
      endTime: rawEndTime !== undefined ? rawEndTime : existingEvent.schedule?.endTime
    };
  }

  // Handle ticket tiers:
  if (data.ticketTiers !== undefined || data.ticketType !== undefined || data.totalTickets !== undefined || data.ticketPrice !== undefined) {
    let ticketTiers = data.ticketTiers;
    const effectiveTicketType = data.ticketType || existingEvent.ticketType;

    if (effectiveTicketType === "Free") {
      let soldVal = 0;
      if (existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
        soldVal = existingEvent.ticketTiers[0].sold || 0;
      }
      ticketTiers = [{
        name: "General Admission",
        price: 0,
        capacity: Number(data.totalTickets) || existingEvent.totalTickets || 100,
        sold: soldVal,
        benefits: ["General Entry"]
      }];
    } else if (effectiveTicketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
      let soldVal = 0;
      if (existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
        soldVal = existingEvent.ticketTiers[0].sold || 0;
      }
      ticketTiers = [{
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
          let soldVal = 0;
          const oldTier = existingEvent.ticketTiers[idx] || existingEvent.ticketTiers.find(t => t.name === tier.name);
          if (oldTier) {
            soldVal = oldTier.sold || 0;
          }
          return {
            ...tier,
            sold: soldVal
          };
        });
      }
    }

    if (ticketTiers) {
      updateData.ticketTiers = ticketTiers;
      if (data.totalTickets !== undefined && data.totalTickets !== '') updateData.totalTickets = Number(data.totalTickets);
      if (data.ticketPrice !== undefined && data.ticketPrice !== '') updateData.ticketPrice = Number(data.ticketPrice);
    }
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

  return await updateEventRepo(eventId, vendorId, updateData);
};

export const deleteEventService = async (eventId, vendorId) => {
  return await deleteEventRepo(eventId, vendorId);
};

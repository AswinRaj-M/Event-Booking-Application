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

const validateOfferDates = (offerEnabled, validFrom, validUntil) => {
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
};

export const createEventService = async(data)=>{
  validateOfferDates(data.offerEnabled, data.validFrom, data.validUntil);

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
      date : data.date || undefined,
      startTime : data.startTime || undefined,
      endTime : data.endTime || undefined
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
      validFrom : data.validFrom || undefined,
      validUntil : data.validUntil || undefined
    }
  })

  return event
}

export const getVendorEventsService = async (vendorId) => {
  const events =  await getVendorEventsRepo(vendorId);
  return events.map((event) =>{
    const totalTickets = (event.ticketTiers || []).reduce(
      (sum,tier) => sum + (tier.capacity || 0), 0
    );
    const soldTickets = event.soldTickets || (event.ticketTiers || []).reduce(
      (sum, tier) => sum + (tier.sold || 0), 0
    );

    return {
      ...event.toObject(),
      totalTickets,
      soldTickets
    }
  })
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
    paymentStatus: "paid"
  });

  let refundedCount = 0;
  for (const booking of paidBookings) {
    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "refunded";
    if (booking.tickets && booking.tickets.length > 0) {
      booking.tickets.forEach(t => { t.status = "cancelled"; });
    }
    await booking.save();

    try {
      await processVendorBookingRefund(booking);
      refundedCount++;
    } catch (err) {
      console.error(`[Cancel Event] Error refunding booking ${booking._id}:`, err);
    }
  }

  event.eventStatus = "cancelled";
  await event.save();

  return {
    event,
    refundedBookingsCount: refundedCount
  };
};

export const updateEventService = async (eventId, vendorId, data) => {
  const existingEvent = await Event.findOne({ _id: eventId, vendorId });
  let ticketTiers = data.ticketTiers;

  if (data.ticketType === "Free") {
    let soldVal = 0;
    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
      soldVal = existingEvent.ticketTiers[0].sold || 0;
    }
    ticketTiers = [{
      name: "General Admission",
      price: 0,
      capacity: Number(data.totalTickets) || 100,
      sold: soldVal,
      benefits: ["General Entry"]
    }];
  } else if (data.ticketType === "Paid" && (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0)) {
    let soldVal = 0;
    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
      soldVal = existingEvent.ticketTiers[0].sold || 0;
    }
    ticketTiers = [{
      name: "General Admission",
      price: Number(data.ticketPrice) || 0,
      capacity: Number(data.totalTickets) || 100,
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

    if (existingEvent && existingEvent.ticketTiers && existingEvent.ticketTiers.length > 0) {
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

  const updateData = {
    title: data.title,
    description: data.description,
    category: data.category || undefined,
    eventType: data.eventType || undefined,
    onlineLink: data.onlineLink,
    
    schedule: {
      date: data.date || undefined,
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined
    },

    venue: data.venue,
    address: data.address,
    city: data.city,
    state: data.state,

    location: {
      latitude: Number(data.latitude) || undefined,
      longitude: Number(data.longitude) || undefined
    },

    ageRestriction: {
      enabled: data.ageRestriction === "true" || data.ageRestriction === true,
      minAge: 18,
    },

    ticketType: data.ticketType,
    ticketTiers: ticketTiers,
    maxTicketPerPerson: Number(data.maxTicketPerPerson) || undefined,
  };

  if (data.eventStatus) {
    updateData.eventStatus = data.eventStatus;
  }

  if (data.offerEnabled !== undefined) {
    const offerEnabled = data.offerEnabled === "true" || data.offerEnabled === true;
    if (offerEnabled) {
      validateOfferDates(data.offerEnabled, data.validFrom, data.validUntil);
    }
    updateData.offer = {
      enabled: offerEnabled,
      discountValue: Number(data.discountValue) || 0,
      minTicketsRequired: Number(data.minTicketsRequired) || 0,
      validFrom: data.validFrom || undefined,
      validUntil: data.validUntil || undefined
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

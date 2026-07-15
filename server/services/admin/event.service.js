import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { sendMail } from "../../utils/sendMail.js";

import {
  getAllEventsRepo,
  findEventById,
  saveEvent,
} from "../../repository/admin/event.repo.js";

import {
  findVendorById,
} from "../../repository/admin/vendor.repo.js";

export const getAllEventsService = async () => {
  return await getAllEventsRepo();
};
 
export const toggleBlockEventService = async (eventId, reason) => {
  const event = await findEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }
  event.isBlocked = !event.isBlocked;
  if (event.isBlocked) {
    event.blockedReason = reason || "";
    const vendor = await findVendorById(event.vendorId);
    if (vendor && vendor.businessEmail) {
      const emailSubject = `Event Blocked: ${event.title}`;
      const emailBody = `Dear ${vendor.organizerName || 'Vendor'},<br/><br/>We regret to inform you that your event "<strong>${event.title}</strong>" has been blocked by the platform administrator for the following reason:<br/><br/><em>"${reason || "No reason specified"}"</em><br/><br/>If you believe this is a mistake, please contact platform support.`;
      try {
        await sendMail(vendor.businessEmail, emailBody, emailSubject);
      } catch (err) {
        console.error("Failed to send block notification email:", err);
      }
    }
  } else {
    event.blockedReason = undefined;
  }
  await saveEvent(event);
  
  const all = await getAllEventsRepo();
  return all.find(e => e._id.toString() === eventId);
};

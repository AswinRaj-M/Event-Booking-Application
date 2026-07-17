import Event from "../../models/event.model.js";
import { updateCompletedEvents } from "../../utils/eventStatusUpdater.js";

export const getAllEventsRepo = async () => {
  await updateCompletedEvents();
  return await Event.find({ isDeleted: { $ne: true }, eventStatus: { $ne: "draft" } })
    .sort({ createdAt: -1 })
    .populate("category")
    .populate("vendorId");
};

export const findEventById = async (id) => {
  return await Event.findById(id);
};

export const saveEvent = async (event) => {
  return await event.save();
};

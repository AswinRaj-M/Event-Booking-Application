import Event from "../../models/event.model.js";

export const createEventRepo = async(data) =>{
  return await Event.create(data)
}

export const getVendorEventsRepo = async(vendorId) => {
  return await Event.find({ vendorId, isDeleted: { $ne: true } })
  .sort({createdAt : -1})
  .populate("category")
}

export const cancelEventRepo = async (eventId, vendorId) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId },
    { $set: { eventStatus: "cancelled" } },
    { new: true }
  )
}

export const updateEventRepo = async (eventId, vendorId, updateData) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId },
    { $set: updateData },
    { new: true }
  ).populate("category")
}

export const deleteEventRepo = async (eventId, vendorId) => {
  return await Event.findOneAndUpdate(
    { _id: eventId, vendorId, eventStatus: { $in: ["cancelled", "draft"] } },
    { $set: { isDeleted: true } },
    { new: true }
  )
}

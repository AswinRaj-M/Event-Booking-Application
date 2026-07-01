import Event from "../models/event.model.js";
import Vendor from "../models/vendor.model.js";

export const createVendor = async (data) => {
  return await Vendor.create(data);
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
};

export const findVendorByIdAndUpdate = async(vendorId,updateData) =>{
  return await Vendor.findByIdAndUpdate(
    vendorId,
    {$set : updateData},
    {new : true}
  )
}

export const findVendorByRefreshToken = async (token) => {
  return await Vendor.findOne({ refreshToken: token });
};

export const clearVendorRefreshToken = async (token) => {
  return await Vendor.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
};

export const addVendorPortfolioPicture = async (vendorId, fileData) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $push: { portfolioPictures: fileData } },
    { new: true }
  );
};

export const removeVendorImage = async (vendorId, imageField) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $unset: { [imageField]: 1 } },
    { new: true }
  );
};

export const removeVendorPortfolioPicture = async (vendorId, pictureId) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $pull: { portfolioPictures: { _id: pictureId } } },
    { new: true }
  );
};

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
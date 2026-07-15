import { AppError } from "../../utils/AppError.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  createEventService,
  getVendorEventsService,
  cancelEventService,
  updateEventService,
  deleteEventService,
} from "../../services/vendor/event.service.js";

export const createEvent = async(req,res) =>{
  console.log("req.body : " ,req.body)
  console.log("status :",req.body.eventStatus)
  const vendorId = req.user._id

  if(!vendorId){
    throw new AppError("vendor ID is required",HTTP_STATUS.BAD_REQUEST)
  }

  if (req.body.ticketTiers && typeof req.body.ticketTiers === 'string') {
    try {
      req.body.ticketTiers = JSON.parse(req.body.ticketTiers);
    } catch (e) {
      console.error("Error parsing ticketTiers in createEvent:", e);
    }
  }

  let thumbnail = null;

  if (req.files?.thumbnail?.[0]) {
    const thumbnailUpload = await uploadToCloudinary(
      req.files.thumbnail[0].buffer,
      "events/thumbnails"
    )
    thumbnail = {
      fileUrl : thumbnailUpload.secure_url,
      publicId : thumbnailUpload.public_id,
      fileType : thumbnailUpload.resource_type
    }
  } else if (req.body.eventStatus !== 'draft') {
    throw new AppError("Thumbnail is required", HTTP_STATUS.BAD_REQUEST);
  }

  let images = []

  if(req.files?.images?.length){
    for(const image of req.files.images){
      const uploadResult = await uploadToCloudinary(
        image.buffer,
        "events/gallery"
      )

      images.push({
        fileUrl : uploadResult.secure_url,
        publicId : uploadResult.public_id,
        fileType : uploadResult.resource_type
      })
    }
  }

  const event = await createEventService({
    ...req.body,
    vendorId,
    thumbnail: thumbnail || undefined,
    images
  })


  return res.status(HTTP_STATUS.CREATED).json({
    success : true,
    message : "Event Created Successfully",
    event
  })

}

export const getVendorEvents = async(req, res) => {
  const vendorId = req.user._id

  if(!vendorId){
    throw new AppError("vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const events = await getVendorEventsService(vendorId)
  
  

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Events Fetched Successfully",
    events
  })
}

export const cancelEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const event = await cancelEventService(eventId, vendorId)

  if (!event) {
    throw new AppError("Event not found or unauthorized", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Cancelled Successfully",
    event
  })
}

export const updateEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (req.body.ticketTiers && typeof req.body.ticketTiers === 'string') {
    try {
      req.body.ticketTiers = JSON.parse(req.body.ticketTiers);
    } catch (e) {
      console.error("Error parsing ticketTiers in updateEvent:", e);
    }
  }

  let thumbnail = null
  const thumbnailFile = req.file || req.files?.thumbnail?.[0]
  if (thumbnailFile) {
    const thumbnailUpload = await uploadToCloudinary(
      thumbnailFile.buffer,
      "events/thumbnails"
    )
    thumbnail = {
      fileUrl: thumbnailUpload.secure_url,
      publicId: thumbnailUpload.public_id,
      fileType: thumbnailUpload.resource_type,
    }
  }

  let existingImages = undefined
  if (req.body.existingImages !== undefined) {
    try {
      existingImages = JSON.parse(req.body.existingImages)
    } catch (e) {
      console.error("Error parsing existingImages:", e)
    }
  }

  let newImages = []
  if (req.files?.images?.length) {
    for (const image of req.files.images) {
      const uploadResult = await uploadToCloudinary(
        image.buffer,
        "events/gallery"
      )
      newImages.push({
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType: uploadResult.resource_type
      })
    }
  }

  let updatedImages = undefined
  if (req.body.existingImages !== undefined || req.files?.images?.length) {
    updatedImages = [...(existingImages || []), ...newImages]
  }

  const updatedEvent = await updateEventService(eventId, vendorId, {
    ...req.body,
    thumbnail: thumbnail || undefined,
    images: updatedImages,
  })

  if (!updatedEvent) {
    throw new AppError("Event not found or unauthorized to update", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Updated Successfully",
    event: updatedEvent,
  })
}

export const deleteEvent = async (req, res) => {
  const vendorId = req.user._id
  const { eventId } = req.params

  if (!vendorId) {
    throw new AppError("Vendor ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  if (!eventId) {
    throw new AppError("Event ID is required", HTTP_STATUS.BAD_REQUEST)
  }

  const event = await deleteEventService(eventId, vendorId)

  if (!event) {
    throw new AppError("Event not found or cannot be deleted (only cancelled or draft events can be deleted)", HTTP_STATUS.NOT_FOUND)
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Event Deleted Successfully",
    event,
  })
}

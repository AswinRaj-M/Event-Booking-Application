import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  getAllEventsService,
  toggleBlockEventService,
} from "../../services/admin/event.service.js";

export const getAllEventsAdmin = async (req, res) => {
  const events = await getAllEventsService();
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Events fetched successfully",
    events
  });
};       

export const toggleBlockEvent = async (req, res) => {
  const { eventId } = req.params;
  const { reason } = req.body;
  const event = await toggleBlockEventService(eventId, reason);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Event status updated successfully`,
    event
  });
};

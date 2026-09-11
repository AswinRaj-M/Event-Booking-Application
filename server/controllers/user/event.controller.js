import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { AppError } from "../../utils/AppError.js";

import {
  getExploreEventsService,
  getEventByIdService,
  getOrganizersService,
  getOrganizerProfileService,
} from "../../services/user/event.service.js";

export const getExploreEvents = async (req, res) => {
  const { search, category, date, page, limit, sortBy } = req.query;
  const result = await getExploreEventsService({ search, category, date, page, limit, sortBy });
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result
  });
};

export const getEventById = async (req, res) => {
  const { id } = req.params;
  const event = await getEventByIdService(id);
  if (!event) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    event
  });
};

export const getOrganizers = async (req, res) => {
  const { limit } = req.query;
  const organizers = await getOrganizersService(limit ? parseInt(limit, 10) : 8);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    organizers
  });
};

export const getOrganizerProfile = async (req, res) => {
  const { id } = req.params;
  const profile = await getOrganizerProfileService(id);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: profile
  });
};


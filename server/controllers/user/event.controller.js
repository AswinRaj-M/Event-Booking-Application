import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import { AppError } from "../../utils/AppError.js";

import {
  getExploreEventsService,
  getEventByIdService,
  getOrganizersService,
  getOrganizerProfileService,
  toggleFollowOrganizerService,
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
  const userId = req.user?._id || req.user?.id || null;
  const { eventsPage, eventsLimit } = req.query;
  const profile = await getOrganizerProfileService(id, userId, { eventsPage, eventsLimit });
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: profile
  });
};

export const toggleFollowOrganizer = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }
  const result = await toggleFollowOrganizerService(userId, id);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.isFollowing ? "Successfully followed organizer" : "Unfollowed organizer",
    ...result
  });
};



import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";
import {
  getExploreEventsRepo,
  findEventById,
  getOrganizersRepo,
  getOrganizerProfileRepo,
  toggleFollowOrganizerRepo,
} from "../../repository/user/event.repo.js";

export const getExploreEventsService = async (filters) => {
  return await getExploreEventsRepo(filters);
};

export const getEventByIdService = async (id) => {
  const event = await findEventById(id);
  if (!event || event.isDeleted) {
    throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
  }
  if (event.isBlocked) {
    throw new AppError("This event is blocked by admin", HTTP_STATUS.FORBIDDEN);
  }
  return event;
};

export const getOrganizersService = async (limit) => {
  return await getOrganizersRepo(limit);
};

export const getOrganizerProfileService = async (vendorId, userId = null, options = {}) => {
  const profile = await getOrganizerProfileRepo(vendorId, userId, options);
  if (!profile) {
    throw new AppError("Organizer profile not found or unavailable", HTTP_STATUS.NOT_FOUND);
  }
  return profile;
};

export const toggleFollowOrganizerService = async (userId, vendorId) => {
  try {
    return await toggleFollowOrganizerRepo(userId, vendorId);
  } catch (err) {
    throw new AppError(err.message || "Failed to update follow status", HTTP_STATUS.BAD_REQUEST);
  }
};


import {
  getExploreEventsRepo,
  findEventById,
  getOrganizersRepo,
} from "../../repository/user/event.repo.js";

export const getExploreEventsService = async (filters) => {
  return await getExploreEventsRepo(filters);
};

export const getEventByIdService = async (id) => {
  return await findEventById(id);
};

export const getOrganizersService = async (limit) => {
  return await getOrganizersRepo(limit);
};

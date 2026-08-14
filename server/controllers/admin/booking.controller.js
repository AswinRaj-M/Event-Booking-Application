import { getAllBookingsAdminService } from "../../services/admin/booking.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

// Get all bookings controller for Admin Booking Management
export const getAllBookingsAdmin = async (req, res) => {
  const { page, limit, search, status, paymentStatus, startDate, endDate } = req.query;

  const data = await getAllBookingsAdminService({
    page,
    limit,
    search,
    status,
    paymentStatus,
    startDate,
    endDate,
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
  });
};

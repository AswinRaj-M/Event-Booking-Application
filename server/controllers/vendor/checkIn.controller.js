import { 
  validateAndCheckInBookingService,
  getVendorRecentCheckInsService 
} from "../../services/vendor/checkIn.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

/**
 * @desc Check-in booking by QR Token
 * @route POST /api/vendors/check-in
 * @access Private (Vendor)
 */
export const checkInTicket = async (req, res) => {
  const vendorId = req.user._id;
  const { qrToken, token, code } = req.body;

  const tokenToValidate = qrToken || token || code;

  const result = await validateAndCheckInBookingService(vendorId, tokenToValidate);

  return res.status(HTTP_STATUS.OK).json(result);
};

/**
 * @desc Get Recent Check-ins for Vendor Events
 * @route GET /api/vendors/check-ins/recent
 * @access Private (Vendor)
 */
export const getRecentCheckIns = async (req, res) => {
  const vendorId = req.user._id;
  const checkIns = await getVendorRecentCheckInsService(vendorId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    checkIns
  });
};

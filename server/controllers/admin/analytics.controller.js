import { getAdminAnalyticsService } from "../../services/admin/analytics.service.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

// Get Admin Analytics Data Controller
export const getAdminAnalytics = async (req, res) => {
  const { timeframe, categoryId } = req.query;
  const data = await getAdminAnalyticsService({ timeframe, categoryId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
  });
};

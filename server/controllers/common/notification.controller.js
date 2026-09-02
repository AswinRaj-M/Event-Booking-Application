import Notification from "../../models/notification.model.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

const getTargetUserId = (req) => {
  const targetId = req.user?.id || req.user?._id || req.vendor?.id || req.vendor?._id || req.admin?.id || req.admin?._id;
  if (!targetId) {
    throw new AppError("Unauthorized: Recipient identity missing", HTTP_STATUS.UNAUTHORIZED);
  }
  return targetId.toString();
};

export const getMyNotifications = async (req, res) => {
  const userId = getTargetUserId(req);

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    notifications,
    unreadCount,
  });
};

export const markMyNotificationsRead = async (req, res) => {
  const userId = getTargetUserId(req);

  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notifications marked as read",
  });
};

export const deleteMyNotification = async (req, res) => {
  const userId = getTargetUserId(req);
  const { id } = req.params;

  if (!id) {
    throw new AppError("Notification ID is required", HTTP_STATUS.BAD_REQUEST);
  }

  const result = await Notification.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    throw new AppError("Notification not found or unauthorized", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notification deleted successfully",
  });
};

export const clearAllMyNotifications = async (req, res) => {
  const userId = getTargetUserId(req);

  await Notification.deleteMany({ userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All notifications cleared successfully",
  });
};

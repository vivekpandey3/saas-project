import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    workspace: req.workspace._id
  })
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  res.json({ notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: req.user._id,
      workspace: req.workspace._id
    },
    { isRead: true }
  );

  res.json({ message: "Notification marked as read" });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, workspace: req.workspace._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: "All notifications marked as read" });
});

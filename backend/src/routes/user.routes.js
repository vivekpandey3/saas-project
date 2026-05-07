import { Router } from "express";
import { getActivityLogs, getWorkspaceUsers } from "../controllers/user.controller.js";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notification.controller.js";
import { requireAuth, requireWorkspace } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireWorkspace);
router.get("/team", getWorkspaceUsers);
router.get("/activity", getActivityLogs);
router.get("/notifications", getMyNotifications);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.patch("/notifications/:notificationId/read", markNotificationRead);

export default router;

import { Router } from "express";
import { getActivityLogs, getWorkspaceUsers } from "../controllers/user.controller.js";
import { requireAuth, requireWorkspace } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireWorkspace);
router.get("/team", getWorkspaceUsers);
router.get("/activity", getActivityLogs);

export default router;

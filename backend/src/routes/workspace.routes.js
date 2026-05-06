import { Router } from "express";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceMembers,
  joinWorkspace
} from "../controllers/workspace.controller.js";
import { requireAdmin, requireAuth, requireWorkspace } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createWorkspaceSchema,
  joinWorkspaceSchema
} from "../validators/workspace.validator.js";

const router = Router();

router.use(requireAuth);
router.get("/", getMyWorkspaces);
router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.post("/join", validate(joinWorkspaceSchema), joinWorkspace);
router.get("/members", requireWorkspace, requireAdmin, getWorkspaceMembers);

export default router;

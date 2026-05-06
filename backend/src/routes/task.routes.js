import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} from "../controllers/task.controller.js";
import { requireAuth, requireWorkspace } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";

const router = Router();

router.use(requireAuth, requireWorkspace);
router.get("/", getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.patch("/:taskId", validate(updateTaskSchema), updateTask);
router.delete("/:taskId", deleteTask);

export default router;

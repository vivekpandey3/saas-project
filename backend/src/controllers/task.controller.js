import { Task } from "../models/Task.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../services/activity.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  const task = await Task.create({
    ...payload,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    workspace: req.workspace._id,
    createdBy: req.user._id
  });

  await logActivity({
    workspaceId: req.workspace._id,
    actorId: req.user._id,
    action: "created task",
    entity: "task",
    entityId: task._id,
    meta: { title: task.title }
  });

  res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ workspace: req.workspace._id })
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ tasks });
});

export const updateTask = asyncHandler(async (req, res) => {
  const updates = req.validated.body;
  const { taskId } = req.validated.params;

  const task = await Task.findOne({ _id: taskId, workspace: req.workspace._id });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (updates.dueDate !== undefined) {
    updates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  }

  Object.assign(task, updates);
  await task.save();

  await logActivity({
    workspaceId: req.workspace._id,
    actorId: req.user._id,
    action: "updated task",
    entity: "task",
    entityId: task._id
  });

  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findOneAndDelete({ _id: taskId, workspace: req.workspace._id });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await logActivity({
    workspaceId: req.workspace._id,
    actorId: req.user._id,
    action: "deleted task",
    entity: "task",
    entityId: task._id
  });

  res.json({ message: "Task deleted" });
});

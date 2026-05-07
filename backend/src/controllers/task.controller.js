import { Task } from "../models/Task.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../services/activity.service.js";
import { emitWorkspaceEvent } from "../services/socket.service.js";
import { createNotification } from "../services/notification.service.js";

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

  emitWorkspaceEvent(req.workspace._id.toString(), "task:created", { task });

  if (task.assignee && String(task.assignee) !== String(req.user._id)) {
    await createNotification({
      workspaceId: req.workspace._id,
      userId: task.assignee,
      actorId: req.user._id,
      type: "task_assigned",
      title: "New task assigned",
      message: `${req.user.name} assigned you a task: ${task.title}`,
      meta: { taskId: task._id }
    });
  }

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

  const oldAssignee = task.assignee ? String(task.assignee) : null;
  Object.assign(task, updates);
  await task.save();

  await logActivity({
    workspaceId: req.workspace._id,
    actorId: req.user._id,
    action: "updated task",
    entity: "task",
    entityId: task._id
  });

  emitWorkspaceEvent(req.workspace._id.toString(), "task:updated", { task });

  const newAssignee = task.assignee ? String(task.assignee) : null;
  if (newAssignee && newAssignee !== oldAssignee && newAssignee !== String(req.user._id)) {
    await createNotification({
      workspaceId: req.workspace._id,
      userId: task.assignee,
      actorId: req.user._id,
      type: "task_assigned",
      title: "Task assigned to you",
      message: `${req.user.name} assigned/updated task: ${task.title}`,
      meta: { taskId: task._id }
    });
  }

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

  emitWorkspaceEvent(req.workspace._id.toString(), "task:deleted", { taskId: task._id.toString() });

  res.json({ message: "Task deleted" });
});

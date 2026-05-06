import { ActivityLog } from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWorkspaceUsers = asyncHandler(async (req, res) => {
  const users = req.workspace.members.map((member) => ({
    id: member.user._id,
    name: member.user.name,
    email: member.user.email,
    role: member.role
  }));

  res.json({ users });
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({ workspace: req.workspace._id })
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ logs });
});
import crypto from "crypto";
import mongoose from "mongoose";
import { Workspace } from "../models/Workspace.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../services/activity.service.js";
import { createNotification } from "../services/notification.service.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.validated.body;

  const workspace = await Workspace.create({
    name,
    inviteCode: crypto.randomBytes(4).toString("hex"),
    owner: req.user._id,
    members: [{ user: req.user._id, role: "admin" }]
  });

  await User.findByIdAndUpdate(req.user._id, { currentWorkspace: workspace._id });

  await logActivity({
    workspaceId: workspace._id,
    actorId: req.user._id,
    action: "created workspace",
    entity: "workspace",
    entityId: workspace._id
  });

  res.status(201).json({ workspace });
});

export const joinWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, inviteCode } = req.validated.body;

  if (!workspaceId && !inviteCode) {
    throw new ApiError(400, "Provide workspaceId or inviteCode to join");
  }

  let workspace = null;

  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    workspace = await Workspace.findById(workspaceId);
  } else if (inviteCode) {
    workspace = await Workspace.findOne({ inviteCode });
  }

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!alreadyMember) {
    const existingMembers = workspace.members.map((member) => member.user.toString());
    workspace.members.push({ user: req.user._id, role: "member" });
    await workspace.save();

    await Promise.all(
      existingMembers
        .filter((memberId) => memberId !== req.user._id.toString())
        .map((memberId) =>
          createNotification({
            workspaceId: workspace._id,
            userId: memberId,
            actorId: req.user._id,
            type: "user_joined",
            title: "New member joined",
            message: `${req.user.name} joined your workspace`,
            meta: { joinedUserId: req.user._id }
          })
        )
    );
  }

  await User.findByIdAndUpdate(req.user._id, { currentWorkspace: workspace._id });

  await logActivity({
    workspaceId: workspace._id,
    actorId: req.user._id,
    action: "joined workspace",
    entity: "member",
    entityId: req.user._id
  });

  res.json({ workspace });
});

export const getMyWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).select(
    "name inviteCode owner members createdAt"
  );
  res.json({ workspaces });
});

export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.workspace._id).populate(
    "members.user",
    "name email"
  );

  res.json({
    members: workspace.members
  });
});

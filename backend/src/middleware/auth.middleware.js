import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env.js"; 
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new ApiError(401, "Authorization token is required");
  }

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.userId).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid token user");
  }

  req.user = user;
  next();
});

export const requireWorkspace = asyncHandler(async (req, res, next) => {
  const workspaceId =
    req.headers["x-workspace-id"] ||
    req.query.workspaceId ||
    req.user.currentWorkspace;

  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new ApiError(400, "Valid workspace id is required");
  }

  const workspace = await Workspace.findById(workspaceId).populate(
    "members.user",
    "name email",
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const member = workspace.members.find(
    (m) => m.user._id.toString() === req.user._id.toString(),
  );

  if (!member) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  req.workspace = workspace;
  req.workspaceRole = member.role;
  next();
});

export const requireAdmin = (req, res, next) => {
  if (req.workspaceRole !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

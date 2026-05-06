import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

const authResponse = (user) => ({
  token: signToken({ userId: user._id }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    currentWorkspace: user.currentWorkspace
  }
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, workspaceName } = req.validated.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  const workspace = await Workspace.create({
    name: workspaceName,
    inviteCode: crypto.randomBytes(4).toString("hex"),
    owner: user._id,
    members: [{ user: user._id, role: "admin" }]
  });

  user.currentWorkspace = workspace._id;
  await user.save();

  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.json(authResponse(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});

import mongoose from "mongoose";
import { z } from "zod";

const POSITIONS = [
  "CEO",
  "CTO",
  "Developer",
  "Tester",
  "DevOps",
  "Operational",
  "Manager",
  "Designer",
  "Sales",
  "Marketing",
];

export const teamMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be non-registered member
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      enum: POSITIONS,
      required: true,
      default: "Developer",
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      required: true,
      default: "member",
    },
    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "invited"],
      default: "active",
    },
    permissions: {
      canCreateTasks: { type: Boolean, default: true },
      canDeleteTasks: { type: Boolean, default: false },
      canAssignTasks: { type: Boolean, default: false },
      canManageTeam: { type: Boolean, default: false },
      canDeleteMembers: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Auto-update permissions based on role
teamMemberSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.permissions = {
      canCreateTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
      canManageTeam: true,
      canDeleteMembers: true,
    };
  } else if (this.role === "member") {
    this.permissions = {
      canCreateTasks: true,
      canDeleteTasks: false,
      canAssignTasks: false,
      canManageTeam: false,
      canDeleteMembers: false,
    };
  } else {
    this.permissions = {
      canCreateTasks: false,
      canDeleteTasks: false,
      canAssignTasks: false,
      canManageTeam: false,
      canDeleteMembers: false,
    };
  }
  next();
});

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

// Validation schemas
export const createTeamMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  position: z.enum(POSITIONS),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateTeamMemberSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  position: z.enum(POSITIONS).optional(),
  role: z.enum(["admin", "member", "viewer"]).optional(),
  status: z.enum(["active", "inactive", "invited"]).optional(),
});

export const assignTaskSchema = z.object({
  taskId: z.string(),
});
import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [workspaceMemberSchema]
  },
  { timestamps: true }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);

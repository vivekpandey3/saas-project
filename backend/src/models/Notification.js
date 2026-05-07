import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["task_assigned", "user_joined"],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    meta: {
      type: Object,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);

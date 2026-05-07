import { Notification } from "../models/Notification.js";
import { emitUserEvent } from "./socket.service.js";

export const createNotification = async ({
  workspaceId,
  userId,
  actorId,
  type,
  title,
  message,
  meta = {}
}) => {
  const notification = await Notification.create({
    workspace: workspaceId,
    user: userId,
    actor: actorId,
    type,
    title,
    message,
    meta
  });

  emitUserEvent(String(userId), "notification:new", { notification });
  return notification;
};

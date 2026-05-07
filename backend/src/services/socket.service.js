import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { Workspace } from "../models/Workspace.js";

let io = null;
const workspaceUsers = new Map();

const roomName = (workspaceId) => `workspace:${workspaceId}`;
const userRoomName = (userId) => `user:${userId}`;

const broadcastPresence = (workspaceId) => {
  const users = workspaceUsers.get(workspaceId) || new Set();
  io.to(roomName(workspaceId)).emit("presence:update", {
    workspaceId,
    onlineCount: users.size
  });
};

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const workspaceId = socket.handshake.auth?.workspaceId;

      if (!token || !workspaceId) {
        return next(new Error("Missing socket auth token/workspace"));
      }

      const payload = jwt.verify(token, env.jwtSecret);
      const workspace = await Workspace.findById(workspaceId).select("members.user");

      if (!workspace) {
        return next(new Error("Workspace not found"));
      }

      const isMember = workspace.members.some(
        (member) => member.user.toString() === payload.userId
      );
      if (!isMember) {
        return next(new Error("Not allowed for workspace"));
      }

      socket.data.userId = payload.userId;
      socket.data.workspaceId = workspaceId;
      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, workspaceId } = socket.data;
    socket.join(roomName(workspaceId));
    socket.join(userRoomName(userId));

    if (!workspaceUsers.has(workspaceId)) {
      workspaceUsers.set(workspaceId, new Set());
    }
    workspaceUsers.get(workspaceId).add(userId);
    broadcastPresence(workspaceId);

    socket.on("disconnect", () => {
      const users = workspaceUsers.get(workspaceId);
      if (!users) return;

      users.delete(userId);
      if (users.size === 0) {
        workspaceUsers.delete(workspaceId);
      }
      broadcastPresence(workspaceId);
    });
  });
};

export const emitWorkspaceEvent = (workspaceId, eventName, payload) => {
  if (!io) return;
  io.to(roomName(workspaceId)).emit(eventName, payload);
};

export const emitUserEvent = (userId, eventName, payload) => {
  if (!io) return;
  io.to(userRoomName(userId)).emit(eventName, payload);
};

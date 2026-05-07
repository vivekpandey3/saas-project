import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const connectWorkspaceSocket = ({ token, workspaceId }) => {
  if (!token || !workspaceId) return null;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token, workspaceId }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

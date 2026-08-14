import { io } from "socket.io-client";

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketURL();

let socket = null;

export const getSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        userId,
      },
    });

    socket.on("connect", () => {
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("connect_error", () => {
      // Connection error handled silently
    });
  } else {
    if (userId) {
      socket.auth = { userId };
      if (socket.connected) {
        socket.emit("join", userId);
      } else {
        socket.connect();
      }
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

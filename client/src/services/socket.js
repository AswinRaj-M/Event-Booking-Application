import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

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
      console.log("[Socket.IO] Connected to backend, id:", socket.id);
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket.IO] Connection error:", err.message);
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

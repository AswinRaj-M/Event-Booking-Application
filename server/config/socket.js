import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

const extractTargetId = (target) => {
  if (!target) return null;
  if (typeof target === "string") return target;
  if (target._id) return target._id.toString();
  if (target.id) return target.id.toString();
  if (typeof target.toString === "function") {
    const str = target.toString();
    if (str !== "[object Object]") return str;
  }
  return null;
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Accept request from all client dev origins
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.userId = decoded.id || decoded._id;
      } else if (socket.handshake.auth?.userId) {
        socket.userId = extractTargetId(socket.handshake.auth.userId);
      }
    } catch (err) {
      if (socket.handshake.auth?.userId) {
        socket.userId = extractTargetId(socket.handshake.auth.userId);
      }
    }
    return next();
  });

  io.on("connection", (socket) => {
    const rawUserId = socket.userId || socket.handshake.auth?.userId;
    const targetId = extractTargetId(rawUserId);
    if (targetId) {
      const room = `user:${targetId}`;
      socket.join(room);
      console.log(`[Socket.IO] User ${targetId} connected and joined room: ${room}`);
    }

    socket.on("join", (userIdToJoin) => {
      const targetIdToJoin = extractTargetId(userIdToJoin);
      if (targetIdToJoin) {
        const room = `user:${targetIdToJoin}`;
        socket.join(room);
        console.log(`[Socket.IO] User explicitly joined room: ${room}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => io;

export const sendNotification = (userTarget, data = {}) => {
  if (!io || !userTarget) {
    console.warn("[Socket.IO] sendNotification called but io or userTarget missing", { io: !!io, userTarget });
    return;
  }

  const targetId = extractTargetId(userTarget);
  if (!targetId) {
    console.warn("[Socket.IO] Could not extract valid userId from userTarget:", userTarget);
    return;
  }

  const payload = {
    _id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    title: data.title || "Notification",
    message: data.message || "",
    type: data.type || "INFO",
    createdAt: data.createdAt || new Date().toISOString(),
  };

  const room = `user:${targetId}`;
  console.log(`[Socket.IO] Emitting notification to room "${room}":`, payload);
  io.to(room).emit("notification", payload);
};

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

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
    }

    socket.on("join", (userIdToJoin) => {
      const targetIdToJoin = extractTargetId(userIdToJoin);
      if (targetIdToJoin) {
        const room = `user:${targetIdToJoin}`;
        socket.join(room);
      }
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => io;

export const sendNotification = async (userTarget, data = {}) => {
  const targetId = extractTargetId(userTarget);
  if (!targetId) {
    return;
  }

  try {
    const savedDoc = await Notification.create({
      userId: targetId,
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "INFO",
      isRead: false,
    });

    const payload = {
      _id: savedDoc._id.toString(),
      userId: targetId,
      title: savedDoc.title,
      message: savedDoc.message,
      type: savedDoc.type,
      isRead: savedDoc.isRead,
      createdAt: savedDoc.createdAt ? savedDoc.createdAt.toISOString() : new Date().toISOString(),
    };

    if (io) {
      const room = `user:${targetId}`;
      io.to(room).emit("notification", payload);
    }

    return savedDoc;
  } catch (err) {
    console.error("Error creating and sending notification:", err);
  }
};

export const sendAdminNotification = async (data = {}) => {
  try {
    const adminUsers = await User.find({
      $or: [{ role: { $regex: /^admin$/i } }, { email: { $regex: /admin/i } }],
    }).select("_id");

    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        await sendNotification(admin._id, data);
      }
    }
  } catch (err) {
    console.error("Error sending admin notification:", err);
  }
};

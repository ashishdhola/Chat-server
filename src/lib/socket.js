import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://chat-react-rho-flax.vercel.app/"],
  },
});

// Store online users { userId: socketId }
const userSocketMap = new Map();

export function getReceiverSocketId(userId) {
  return userSocketMap.get(userId);
}

io.on("connection", (socket) => {
  try {
    // Validate token
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("No token provided");
      return socket.disconnect(true);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    const userId = decoded.userId; // Extract userId from token payload

    console.log("User authenticated:", userId, socket.id);

    // Store user in map
    userSocketMap.set(userId, socket.id);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
      console.log("User disconnected", userId);
      userSocketMap.delete(userId);
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
  } catch (error) {
    console.log("Authentication error:", error.message);
    socket.disconnect(true);
  }
});

export { io, app, server };

const { Server } = require("socket.io");
const Message = require("../Modal/Message");
import http from "http"; // Add this line to import http
const express = require("express"); // Import express
const app = express(); // Create express app

// Store connected users by userId


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"];
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Store user data
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});
io.on("connection", (socket) => {
  const userId = socket.user?.id;
  if (!userId) {
    console.log("❌ No userId found in socket");
    socket.disconnect();
    return;
  }

  connectedUsers[userId] = socket;
  console.log(`✅ User connected: ${socket.id}, UserID: ${userId}`);

  socket.emit("server-message", `👋 Welcome, ${socket.user.name || "User"}!`);

  socket.on("private-message", async ({ toUserId, message }) => {
    const fromUserId = socket.user.id;
    const fromUserName = socket.user.name;

    console.log(`💬 Message from ${fromUserId} to ${toUserId}: ${message}`);

    try {
      const newMessage = new Message({ fromUserId, toUserId, message });
      await newMessage.save();

      // Send to recipient
      const recipientSocket = connectedUsers[toUserId];
      if (recipientSocket) {
        recipientSocket.emit("private-message", {
          fromUserId,
          fromUserName,
          message,
          timestamp: newMessage.timestamp
        });
      }

      // Ack to sender
      socket.emit("message-sent", {
        toUserId,
        message,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error("❌ Failed to store message:", error);
      socket.emit("server-message", "❌ Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    delete connectedUsers[userId];
  });
});

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Routes
const authRoutes = require("./routers/authRoutes");
const newUserRoutes = require("./routers/newUserRout");
const connectDB = require("./DB/db");
const verifyToken = require("./Middleware/Middleware");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", newUserRoutes);
app.use("/api/private", verifyToken, (req, res) => {
  res.json({ message: "Access granted to private route", user: req.user });
});


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
  console.log(`✅ User connected: ${socket.id}, UserID: ${socket.user.id}`);

  // Welcome message
  socket.emit("server-message", `👋 Welcome, ${socket.user.name || "User"}!`);

  socket.on("client-message", (msg) => {
    console.log(`📩 From ${socket.user.id}:`, msg);
    io.emit("server-message", `📢 ${socket.user.name || "User"} says: ${msg}`);
  });


  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Connect DB & start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    console.log("✅ DB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ DB connection failed", error);  
    process.exit(1);
  });

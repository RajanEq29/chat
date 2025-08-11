const express = require("express");
const authRoutes = require("./routers/authRoutes");
const connectDB = require("./DB/db");
const verifyToken = require("./Middleware/Middleware");
require('dotenv').config();
const newUserRoutes = require("./routers/newUserRout");
const {Server }= require('socket.io')
const http= require('http')

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Only this needed for JSON body parsing

app.use("/api/auth", authRoutes);
app.use("/api/user", newUserRoutes);

app.use("/api/private", verifyToken, (req, res) => {
  res.json({ message: "Access granted to private route", user: req.user });
});
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*', // allow React Native app to connectwqe
//      methods: ['GET', 'POST']
//   }
// });
// io.on('connection', (socket) => {
//   console.log('✅ Client connected:', socket.id);

//   // Send a welcome message to this client
//   socket.emit('server-message', `👋 Welcome to the socket server!${socket.id}`);

//   // Listen for messages from the client
//   socket.on('client-message', (msg) => {
//     console.log('📩 Received from client:', msg ,socket.id);

//     // Broadcast to all connected clients
//     io.emit('server-message', `📢 Server got: ${msg}`);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });
// });
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("DB connected, starting server...");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
    process.exit(1);
  });

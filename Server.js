// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import http from "http";
import { Server } from "socket.io";

import userRoute from "./Route/UserRoute.js";
import productRoute from "./Route/ProductRoute.js";
import orderRoute from "./Route/OrderRoute.js";
import messageRoute from "./Route/messageRoute.js";
import ConnectDB from "./ConnectDb/connectDB.js";
import error from "./Middleware/error.js";
import { v2 } from "cloudinary";
import Message from "./Model/MessageModal.js";

process.on("uncaughtException", (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

dotenv.config();
const app = express();
const server = http.createServer(app);

// i have added method and allowedHeader in this io cors
const io = new Server(server, {
  cors: {
    origin: [
      'https://lusailnumbers.com',
      'https://backend.lusailnumbers.com',
      'http://localhost:3000',
    ],
    credentials: true,
  },
  path: '/api/socket.io',
});


app.set("io", io);

const PORT = process.env.PORT || 5000;

v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_API_Key,
  api_secret: process.env.API_Secret_Key,
});

app.use(express.json({ limit: "50mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: false,
  })
);
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'https://lusailnumbers.com',
      'https://backend.lusailnumbers.com',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", messageRoute);

app.use(error);
``;
app.get("/", (req, res) => {
  res.send("API is running....");
});
// Socket.IO setup for handling real-time messages
let users = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    users.push({ userId, socketId: socket.id });
    console.log(`${userId} joined the chat.`);
  });

  socket.on("sendMessage", async (message) => {
    try {
      const newMessage = await Message.create({
        sender: message.senderId,
        receiver: message.receiverId,
        content: message.content,
      });

      const receiver = users.find((user) => user.userId === message.receiverId);

      if (receiver) {
        socket.to(receiver.socketId).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    users = users.filter((user) => user.socketId !== socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  ConnectDB();
});

process.on("unhandledRejection", (err) => {
  console.log("Server rejected");
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

export { io };

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import http from 'http';
import { Server } from 'socket.io';

import userRoute from './Route/UserRoute.js';
import productRoute from './Route/ProductRoute.js';
import orderRoute from './Route/OrderRoute.js';
import messageRoute from './Route/messageRoute.js';
import ConnectDB from './ConnectDb/connectDB.js';
import error from './Middleware/error.js';
import { v2 } from 'cloudinary';
import Message from './Model/MessageModal.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

// Load environment variables
dotenv.config();

// Ensure required environment variables are present
if (!process.env.FRONT_END_URL || !process.env.Cloud_Name || !process.env.Cloud_API_Key || !process.env.API_Secret_Key) {
  console.error('Missing required environment variables');
  process.exit(1); // Exit if essential environment variables are missing
}

const app = express();
const server = http.createServer(app);

// CORS setup for Express API
app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true,
}));

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

app.set('io', io);

// Cloudinary configuration
v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_API_Key,
  api_secret: process.env.API_Secret_Key,
});

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: false,
  })
);

// Routes
app.use('/api/v1', userRoute);
app.use('/api/v1', productRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', messageRoute);

// Error handling middleware
app.use(error);

// Socket.IO event handlers
let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    users.push({ userId, socketId: socket.id });
    console.log(`${userId} joined the chat.`);
  });

  socket.on('sendMessage', async (message) => {
    try {
      const newMessage = await Message.create({
        sender: message.senderId,
        receiver: message.receiverId,
        content: message.content,
      });

      const receiver = users.find((user) => user.userId === message.receiverId);

      if (receiver) {
        socket.to(receiver.socketId).emit('receiveMessage', newMessage);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    users = users.filter((user) => user.socketId !== socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  ConnectDB();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

export { io };

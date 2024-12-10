// server.js
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
import messageRoute from './Route/messageRoute.js'; // External route for messages
import ConnectDB from './ConnectDb/connectDB.js';
import error from './Middleware/error.js';
import { v2 } from 'cloudinary';
import Message from './Model/MessageModal.js';

process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    credentials: true,
  },
});

app.set('io', io); // Set io instance to app

const PORT = process.env.PORT || 5000;

v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_API_Key,
  api_secret: process.env.API_Secret_Key,
});

app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
  })
);

app.use('/api/v1', userRoute);
app.use('/api/v1', productRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', messageRoute); // Use message route

app.use(error);

// Socket.IO setup for handling real-time messages
let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user join event
  socket.on('join', (userId) => {
    users.push({ userId, socketId: socket.id });
    console.log(`${userId} joined the chat.`);
  });

  // Handle sending a new message
  socket.on('sendMessage', async (message) => {
    try {
      const newMessage = await Message.create({
        sender: message.senderId,
        receiver: message.receiverId,
        content: message.content,
      });

      // Find the receiver's socketId
      const receiver = users.find((user) => user.userId === message.receiverId);

      if (receiver) {
        socket.to(receiver.socketId).emit('receiveMessage', newMessage);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    users = users.filter((user) => user.socketId !== socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  ConnectDB();
});

process.on('unhandledRejection', (err) => {
  console.log('Server rejected');
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

export { io };

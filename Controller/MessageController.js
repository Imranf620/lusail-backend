import Chat from '../Model/chatModel.js';
import Notification from '../Model/notificationModal.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import Message from './../Model/MessageModal.js';
export const sendMessage = async (req, res, io) => {
  // console.log('body', req.body);
  // console.log('user', req.user);
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    if (!userId || !userRole) {
      return res
        .status(400)
        .json({ message: 'User ID and role are required.' });
    }

    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: 'Receiver ID and content are required.' });
    }

    if (userRole === 'buyer') {
      console.log('Buyer is messaging');

      const notificationChat = new Notification({
        sellerId: receiverId,
        buyerId: userId,
      });
      console.log(notificationChat);
      await notificationChat.save();

      // Emit the notification to the specific receiverId (assuming sockets are managed by user ID)
      io.to(receiverId).emit('notification', notificationChat);
      // console.log('Notification emitted to seller:', notificationChat);
    } else if (userRole === 'seller') {
      console.log('Seller is messaging');

      const notificationChat = new Notification({
        sellerId: userId,
        buyerId: receiverId,
      });
      console.log(notificationChat);
      await notificationChat.save();

      // Emit the notification to the specific buyer
      io.to(receiverId).emit('notification', notificationChat);
      // console.log('Notification emitted to buyer:', notificationChat);
    }

    const newMessage = new Message({
      sender: userId, // Changed from senderId to userId
      receiver: receiverId,
      content: content,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error); // Added logging for debugging
    res
      .status(500)
      .json({ message: 'Error sending message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user._id;
  const { receiverId } = req.query;
  // console.log(first)
  console.log('query', req.query);
  // Validate senderId
  if (!receiverId) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: receiverId required' });
  }

  try {
    // Query to find messages between sender and receiver (both directions)
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching messages', error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    // Assuming `req.user._id` contains the logged-in user's ID
    const userID = req.user._id;
    const userRole = req.user.role;
    // console.log(userID);
    if (!userID && !userRole) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    let notifications;
    if (userRole === 'seller') {
      notifications = await Notification.find({ sellerId: userID });
    } else if (userRole === 'buyer') {
      notifications = await Notification.find({ buyerId: userID });
    }

    // console.log(notifications);
    // If no notifications found
    if (!notifications || notifications.length === 0) {
      return res
        .status(200)
        .json({ message: 'No unseen notifications found.' });
    }
    // console.log('notificatiohn ', notifications);
    // Respond with the unseen notifications
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching notifications', error: error.message });
  }
};

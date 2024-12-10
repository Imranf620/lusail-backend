import Chat from '../Model/chatModel.js';
import Notification from '../Model/notificationModal.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import Message from './../Model/MessageModal.js';

export const sendMessage = async (req, res, io) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  if (!userId && !userRole) {
    return res.status(400).json({ message: 'User ID is required.' });
  }
  const { receiverId, content } = req.body;
  console.log(req.body);

  if (userRole === 'buyer') {
    console.log('Buyer is messaging');

    // Initialize chat
    // const chat = new Chat({
    //   sellerID: senderId,
    //   buyerID: userId,
    // });

    // await chat.save();

    const notificationChat = new Notification({
      sellerId: receiverId,
      buyerId: userId,
    });

    await notificationChat.save();

    // Emit the notification creation event to the receiver
    io.emit('notification', notificationChat); // Broadcast notification to all connected clients
    console.log('Notification emitted:', notificationChat);

    // console.log('Chat initialized:', chat);
  } else if (userRole === 'seller') {
    console.log('Seller is messaging');
    const notificationChat = new Notification({
      sellerId: userId,
      buyerId: receiverId,
    });

    await notificationChat.save();
  }

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error sending message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  console.log('query', req.query);
  // Validate senderId
  if (!senderId) {
    return res.status(401).json({ message: 'Unauthorized: senderId required' });
  }

  try {
    // Query to find messages between sender and receiver (both directions)
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
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
    console.log(userID);
    if (!userID && !userRole) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    let notifications;
    if (userRole === 'seller') {
      notifications = await Notification.find({ sellerId: userID });
    } else if (userRole === 'buyer') {
      notifications = await Notification.find({ buyerId: userID });
    }

    console.log(notifications);
    // If no notifications found
    if (!notifications || notifications.length === 0) {
      return res
        .status(200)
        .json({ message: 'No unseen notifications found.' });
    }
    console.log('notificatiohn ', notifications);
    // Respond with the unseen notifications
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching notifications', error: error.message });
  }
};

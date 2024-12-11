import Notification from '../Model/notificationModal.js';
import Message from './../Model/MessageModal.js';
export const sendMessage = async (req, res, io) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userImage= req.user.imageUrl;
    const userName= req.user.name;
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
        senderName: userName,
        senderImage: userImage,
        message: content,
      });
      console.log(notificationChat);
      await notificationChat.save();

      io.emit('notification', notificationChat);
    } else if (userRole === 'seller') {
      console.log('Seller is messaging');

      const notificationChat = new Notification({
        sellerId: receiverId,
        buyerId: userId,
        senderName: userName,
        senderImage: userImage,
        message: content,
      });
      console.log(notificationChat);
      await notificationChat.save();

      io.emit('notification', notificationChat);
    }

    const newMessage = new Message({
      sender: userId,
      receiver: receiverId,
      content: content,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res
      .status(500)
      .json({ message: 'Error sending message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user._id;
  const { receiverId } = req.query;
  console.log('query', req.query);
  if (!receiverId) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: receiverId required' });
  }

  try {
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
    const userID = req.user._id;
    const userRole = req.user.role;
    if (!userID && !userRole) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    let notifications;
    if (userRole === 'seller') {
      notifications = await Notification.find({ sellerId: userID });
    } else if (userRole === 'buyer') {
      notifications = await Notification.find({ buyerId: userID });
    }

    if (!notifications || notifications.length === 0) {
      return res
        .status(200)
        .json({ message: 'No unseen notifications found.' });
    }

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching notifications', error: error.message });
  }
};

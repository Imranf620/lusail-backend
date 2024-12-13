import Chat from "../Model/chatModel.js";
import Notification from "../Model/notificationModal.js";
import Message from "./../Model/MessageModal.js";

//it will receive the receiverId and the content of the message then send a message to the receiver and save the message in the database also send and create a notification to the receiver
export const sendMessage = async (req, res, io) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userImage = req.user.imageUrl;
    const userName = req.user.name;
    const userEmail = req.user.email;

    if (!userId || !userRole) {
      return res
        .status(400)
        .json({ message: "User ID and role are required." });
    }

    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver ID and content are required." });
    }

    let notificationChat;
    const isChatAlready = await Chat.findOne({
      $or: [
        { seller: receiverId, buyer: userId },
        { seller: userId, buyer: receiverId },
      ],
    });

    if (userRole === "buyer") {
      console.log("Buyer is messaging");
      if (isChatAlready) {
        // Update the existing chat
        await Chat.updateOne(
          { _id: isChatAlready._id },
          {
            $set: {
              lastMessage: content,
              lastMessageBy: "buyer",
            },
          }
        );
      } else {
        // Create a new chat
        const chatCreated = new Chat({
          seller: receiverId,
          buyer: userId,
          lastMessage: content,
          lastMessageBy: "buyer",
        });
        await chatCreated.save();
        console.log(chatCreated);
      }

      notificationChat = new Notification({
        sellerId: receiverId,
        buyerId: userId,
        senderName: userName,
        senderImage: userImage,
        message: content,
        senderEmail: userEmail,
      });

      console.log(notificationChat);
      await notificationChat.save();

      io.emit("notification", notificationChat);
    } else if (userRole === "seller") {
      console.log("Seller is messaging");
      if (isChatAlready) {
        // Update the existing chat
        await Chat.updateOne(
          { _id: isChatAlready._id },
          {
            $set: {
              lastMessage: content,
              lastMessageBy: "seller",
            },
          }
        );
      } else {
        // Create a new chat
        const chatCreated = new Chat({
          seller: userId,
          buyer: receiverId,
          lastMessage: content,
          lastMessageBy: "seller",
        });
        await chatCreated.save();
        console.log(chatCreated);
      }

      notificationChat = new Notification({
        sellerId: userId,
        buyerId: receiverId,
        senderName: userName,
        senderImage: userImage,
        message: content,
        senderEmail: userEmail,
      });

      console.log(notificationChat);
      await notificationChat.save();

      io.emit("notification", notificationChat);
    }

    const newMessage = new Message({
      sender: userId,
      receiver: receiverId,
      content: content,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Emit the new message document with `onMessage`
    io.emit("onMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user._id;
  const { receiverId } = req.query;
  console.log("query", req.query);
  if (!receiverId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: receiverId required" });
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
      .json({ message: "Error fetching messages", error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userID = req.user._id;
    const userRole = req.user.role;
    if (!userID && !userRole) {
      return res.status(400).json({ message: "User ID is required." });
    }
    let notifications;
    if (userRole === "seller") {
      notifications = await Notification.find({ sellerId: userID });
    } else if (userRole === "buyer") {
      console.log("buyer is asking notifications");
      notifications = await Notification.find({ buyerId: userID });
      console.log(notifications);
    }

    if (!notifications || notifications.length === 0) {
      return res
        .status(200)
        .json({ message: "No unseen notifications found." });
    }

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};

//it will receive the secondPartyId and clear all the notifications between the user and the secondParty
export const clearNotifications = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const { secondPartyId } = req.body;

  if (!secondPartyId || !userId || !userRole) {
    return res
      .status(400)
      .json({ message: "Receiver ID and content are required." });
  }

  try {
    if (userRole === "buyer") {
      await Notification.deleteMany({
        buyerId: userId,
        sellerId: secondPartyId,
      });
    } else if (userRole === "seller") {
      await Notification.deleteMany({
        sellerId: userId,
        buyerId: secondPartyId,
      });
    }
    res.status(200).json({
      message: `Notifications cleared for ${userRole} with id ${userId}`,
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      message: `Error clearing notifications for ${userRole} with id ${userId}`,
      error: error.message,
    });
  }
};

//it will send all the chats in the inbox of the user
export const getInbox = async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  if (!userId || !userRole) {
    return res.status(400).json({ message: "User ID and role are required." });
  }
  try {
    let chats;
    if (userRole === "buyer") {
      chats = await Chat.find({ buyer: userId }).populate("seller");
    } else if (userRole === "seller") {
      chats = await Chat.find({ seller: userId }).populate("buyer");
    }
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res
      .status(500)
      .json({ message: "Error fetching inbox", error: error.message });
  }
};

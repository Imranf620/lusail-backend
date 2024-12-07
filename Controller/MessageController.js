import Message from './../Model/MessageModal.js';

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

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
  const receiverId = req.query.receiverId;
  const senderId = req.user?._id;

  if (!senderId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp

    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching messages', error: error.message });
  }
};

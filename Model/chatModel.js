import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Chat Schema
const ChatSchema = new Schema(
  {
    sellerID: {
      type: String, // Storing directly as a string since you'll pass the ID
      required: true,
    },
    buyerID: {
      type: String, // Storing directly as a string
      required: true,
    },
    // messageIDs: [
    //   {
    //     type: String, // Array of strings to store message IDs
    //   },
    // ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Chat = model('Chat', ChatSchema);

export default Chat;

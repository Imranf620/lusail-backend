import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ChatSchema = new Schema(
  {
    sellerID: {
      type: String,
      required: true,
    },
    buyerID: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model('Chat', ChatSchema);

export default Chat;

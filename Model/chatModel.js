import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ChatSchema = new Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    lastMessage: {
      type: String,
      required: true,
    },
    lastMessageBy: {
      type: String,
      enum: ["seller", "buyer"],
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Chat = model("Chat", ChatSchema);

export default Chat;

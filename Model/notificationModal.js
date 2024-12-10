import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Notification Schema
const NotificationSchema = new Schema(
  {
    buyerId: {
      type: String, // Reference to a user
      required: true,
    },
    status: {
      type: String,
      enum: ['seen', 'unseen'], // Restrict values to 'seen' or 'unseen'
      default: 'unseen', // Default value
      required: true,
    },
    sellerId: {
      type: String, // Reference to a user
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Notification = model('Notification', NotificationSchema);

export default Notification;

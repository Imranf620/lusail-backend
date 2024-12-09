import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Notification Schema
const NotificationSchema = new Schema(
  {
    userId: {
      type: String, // Reference to a user
      required: true,
      ref: 'User', // Refers to the User model (adjust if the model is named differently)
    },
    status: {
      type: String,
      enum: ['seen', 'unseen'], // Restrict values to 'seen' or 'unseen'
      default: 'unseen', // Default value
      required: true,
    },
    message: {
      type: Object, // Store the message as an object
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Notification = model('Notification', NotificationSchema);

export default Notification;

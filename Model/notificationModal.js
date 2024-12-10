import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    buyerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['seen', 'unseen'],
      default: 'unseen',
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = model('Notification', NotificationSchema);

export default Notification;

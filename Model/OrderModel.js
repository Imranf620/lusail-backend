import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plateNO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sellerName: {
    type: String,
    default: null,
  },
  buyerName: {
    type: String,
    default: null,
  },
  plateNoDetails: {
    type: String,
    default: null,
  },
  orderStatus: {
    type: String,
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Order', orderSchema);

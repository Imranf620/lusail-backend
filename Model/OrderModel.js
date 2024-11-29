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
  discountedPrice: {
    type: Number,
    default: 0,
  },
  orderStatus: {
    type: String,
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
});

export default mongoose.model('Order', orderSchema);

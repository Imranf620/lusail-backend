import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category:{
    type:String,
    required:true
  },
  plateNo: {
    type: String,
    required: true,
    unique: true,
    maxlength: [6, 'Plate number cannot exceed 6 characters'],
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  availability:{
    type:String,
    default:'active'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName:{
    type:String,
    required:true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Product', productSchema);

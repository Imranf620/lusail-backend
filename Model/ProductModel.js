import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
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
  discountpercent: {
    type: Number,
    default: 0,
    required: true,
    min: [0, 'Discount percent cannot be negative'],
    max: [100, 'Discount percent cannot exceed 100'],
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  availability: {
    type: String,
    default: 'active',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
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

productSchema.pre('save', function (next) {
  if (this.price && this.discountpercent >= 0) {
    this.discountedPrice =
      this.price - (this.price * this.discountpercent) / 100;
  }
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.price && update.discountpercent !== undefined) {
    const discountedPrice =
      update.price - (update.price * update.discountpercent) / 100;
    this.setUpdate({ ...update, discountedPrice });
  }
  next();
});

productSchema.pre('findOneAndDelete', async function (next) {
  try {
    const product = await this.model.findOne(this.getFilter());
    if (!product) return next();

    await mongoose.model('Order').deleteMany({ product: product._id });

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Product', productSchema);

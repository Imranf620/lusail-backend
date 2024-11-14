import mongoose from 'mongoose';
import validator from 'validator';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, 'Name must be at least 3 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validator: [validator.isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 charaaters'],
  },
  role: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema);

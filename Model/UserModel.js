import mongoose from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    select: false,
  },
  role: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  otp: String,
  otpExpires: Date,
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    //Hash the password before saving it to the database
    this.password = await bcryptjs.hash(this.password, 10);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  //Compare the hashed password with the candidate password
  return await bcryptjs.compare(password, this.password);
};

UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

export default mongoose.model('User', UserSchema);

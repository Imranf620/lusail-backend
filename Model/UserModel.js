import mongoose from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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

UserSchema.methods.getResetPasswordToken = function () {
  // Generate a token
  const token = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to resetPasswordToken field in the schema
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  // Return the plain token (to be sent to the user)
  return token;
};

export default mongoose.model('User', UserSchema);

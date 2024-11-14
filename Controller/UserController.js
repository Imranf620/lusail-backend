import UserModel from '../Model/UserModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncError } from '../Middleware/CatchAsyncError.js';

export const Signup = catchAsyncError(async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = await UserModel.create({
    name,
    email,
    password,
    role,
  });

  const token = user.getJWTToken();

  res
    .status(200)
    .cookie('token', token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    })
    .json({ success: true, message: 'User registered successfully', user });
});

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Password mismatch', 400));
  }
  const token = user.getJWTToken();

  res
    .status(200)
    .cookie('token', token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'User logged in successfully',
    });
};

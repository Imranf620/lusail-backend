import UserModel from '../Model/UserModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import nodemailer from 'nodemailer';
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
    .json({
      success: true,
      message: 'User registered successfully',
      user,
      token,
    });
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
      user,
    });
};

export const GetallUsers = catchAsyncError(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export const Logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

export const MyProfile = catchAsyncError(async (req, res, next) => {
  const user = await req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

export const UpdateProfile = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

export const UpdatePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;

  if (!oldPassword || !password || !confirmPassword) {
    return next(
      new ErrorHandler('Please provide all the required fields', 400)
    );
  }

  let user = await UserModel.findById(req.user._id).select('+password');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Old password is incorrect', 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

export const ForgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Please provide an email address', 400));
  }

  let user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User not found with this email', 404));
  }

  // Generate OTP and save it to the user document
  const OTP = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = `Your OTP for password reset is: ${OTP}\n\nIf you did not request this, please ignore this email.`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: message,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email} successfully`,
    });
  } catch (error) {
    console.error('Email send error:', error); // Log the error
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler('Failed to send OTP email', 500));
  }
});

export const VerifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp, email } = req.body; // Include email to find user

  if (!otp || !email) {
    return next(new ErrorHandler('Please provide email and OTP', 400));
  }

  let user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return next(new ErrorHandler('Invalid or expired OTP', 400));
  }

  // OTP is valid, clear it from the user document
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

export const ResetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  // Hash the token to match the stored resetPasswordToken
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  let user = await UserModel.findOne({ resetPasswordToken });
  if (!user) {
    return next(
      new ErrorHandler('Invalid or expired reset password token', 400)
    );
  }

  if (user.resetPasswordExpires < Date.now()) {
    return next(new ErrorHandler('Reset password token has expired', 400));
  }

  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const UpdateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      role: req.body.role,
    },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
  });
});

export const GetSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

export const DeleteOwnProfile = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findByIdAndDelete(req.user._id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

export const DeleteUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

export const UpdateUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user,
  });
});

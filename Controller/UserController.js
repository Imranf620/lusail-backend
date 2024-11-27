import UserModel from '../Model/UserModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { sendMail } from '../sendCustomMail.js';
import { catchAsyncError } from '../Middleware/CatchAsyncError.js';
import { v2 } from 'cloudinary';

export const Signup = catchAsyncError(async (req, res) => {
  const { name, email, password, role } = req.body;
  const file = req.files.image;

  const result = await v2.uploader.upload(file.tempFilePath, {
    folder: 'User Profiles',
  });

  const user = await UserModel.create({
    name,
    email,
    password,
    role,
    imageUrl: result.secure_url,
  });

  const token = user.getJWTToken();
  const otp = user.generateOTP();

  const subject = 'Welcome to Our Website!';
  const text = `Hello ${name},\n\nThank you for joining us at [Your Company Name]! We're excited to have you on board and look forward to providing you with a fantastic experience.\n\nTo complete your registration, please use the OTP below for verification:\n\n<h2 style="font-size: 36px; font-weight: bold; color: #4CAF50;">${otp}</h2>\n\nIf you need any assistance, feel free to reach out to us. We're here to help!\n\nBest regards,\nThe Lusail Numbers plate Team`;

  await sendMail({ to: email, subject, text });

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

export const verifyUser = catchAsyncError(async (req, res, next) => {
  const { otp, email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User with this email not found!', 404));
  }

  if (Date.now() > user.otpExpires) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new OTP.",
      resendOTP: true, // Indicate the client should show the "resend OTP" option
    });
  }

  // Verify OTP
  if (user.otp === otp) {
    user.otp = undefined;
    user.otpExpires = undefined; // Clear the expiry field
    user.status = 'verified';
    await user.save();

    res.status(200).json({
      success: true,
      message: "Welcome to Lusail Number plates.",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Wrong OTP. Please try again.",
    });
  }
});

export const resendOTP = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User with this email not found!', 404));
  }

  // Generate new OTP
  const otp = user.generateOTP();
  await user.save();

  const subject = 'Resend OTP';
  const text = `Hello ${user.name},\n\nHere is your new OTP for verification:\n\n<h2>${otp}</h2>\n\nThis OTP is valid for 5 minutes.\n\nBest regards,\nThe Lusail Numbers plate Team`;

  await sendMail({ to: user.email, subject, text });

  res.status(200).json({
    success: true,
    message: "A new OTP has been sent to your email.",
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

  const OTP = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const message = `
  <p>Hi there,</p>
<p>We received a request to reset your password. Your One-Time Password (OTP) for this process is:</p>
<h2 style="font-size: 36px; font-weight: bold; color: #4CAF50;">${OTP}</h2>
<p>If you did not make this request, please ignore this email. Rest assured, your account is safe.</p>
<p>If you need further assistance, feel free to reach out to us!</p>
<p>Best regards,<br>Your Lusail Numbers plate Team</p>
`;
    await sendMail({
      to: email,
      subject: 'Password Reset OTP',
      text: message,
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email} successfully`,
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler('Failed to send OTP email', 500));
  }
});

export const VerifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp, email } = req.body;

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

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

export const ResetPassword = catchAsyncError(async (req, res, next) => {
  const { newPassword, email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!newPassword) {
    return next(new ErrorHandler('Password required', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
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
      role: req.body.role,
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

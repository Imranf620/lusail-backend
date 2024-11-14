import UserModel from '../Model/UserModel.js';
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

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

  res
    .status(200)
    .json({ success: true, message: 'User registered successfully', user });
});

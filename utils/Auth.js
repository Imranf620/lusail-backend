import ErrorHandler from './ErrorHandler.js';
import User from '../Model/UserModel.js';
import jwt from 'jsonwebtoken';

// Middleware to check if user is logged in
export const isUserLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler('Please login to access this page', 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler('Invalid or expired token', 401));
  }
};

// Middleware to check if user has a specific role
export const isAuthenticated = (roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new ErrorHandler('You are not authenticated', 401));
    }

    // Check if the user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          'You do not have permission to access this resource',
          403
        )
      );
    }

    next();
  };
};

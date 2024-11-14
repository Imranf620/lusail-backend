import ErrorHandler from './ErrorHandler.js';
import User from '../Modal/UserModal.js';
import jwt from 'jsonwebtoken';

export const isUserLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler('Please login to access this page'));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedData.id);

  req.user = user;

  next();
};
export const isAuthenticated = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role == role) {
      return next(new ErrorHandler('You are not authenticated', 400));
    }
    if (req.user.role !== role) {
      return next(new ErrorHandler('You are not authenticated', 400));
    }
    next();
  };
};

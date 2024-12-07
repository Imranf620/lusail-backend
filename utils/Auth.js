import ErrorHandler from './ErrorHandler.js';
import User from '../Model/UserModel.js';
import jwt from 'jsonwebtoken';

export const isUserLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;
  const authorizationHeader = req.headers['authorization'];
  let appToken;

  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    appToken = authorizationHeader.split(' ')[1];
  }

  if (!token && !appToken) {
    return next(new ErrorHandler('Please login to access this page', 401));
  }

  if (token) {
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
  } else {
    try {
      const decodedData = jwt.verify(appToken, process.env.JWT_SECRET);
      const user = await User.findById(decodedData.id);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new ErrorHandler('Invalid or expired token', 401));
    }
  }
};

export const isAuthenticated = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('You are not authenticated', 401));
    }

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

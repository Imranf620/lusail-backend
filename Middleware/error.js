import ErrorHandler from '../utils/ErrorHandler.js';

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const message = `${Object.keys(err.keyValue).join(', ')} already exists`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

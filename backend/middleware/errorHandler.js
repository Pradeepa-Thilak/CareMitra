// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log stack trace for debugging

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle invalid MongoDB ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle duplicate key error (MongoDB error code 11000)
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ') || 'Validation Error';
  }

  // Handle invalid JWT token
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Handle expired JWT token
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Send formatted response
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;

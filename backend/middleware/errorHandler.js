

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); 
  let statusCode = 500;
  let message = 'Internal Server Error';

  
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ') || 'Validation Error';
  }

  
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

 
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;

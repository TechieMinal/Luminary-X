const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  }

  // Only log 5xx errors — 4xx are expected user errors
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message} — ${req.method} ${req.originalUrl}`);
    if (process.env.NODE_ENV === 'development') {
      logger.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    error: null,
  });
};

module.exports = { errorHandler, notFound };

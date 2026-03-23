const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      data: null,
      message,
      error: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development',
  });
};

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

const apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP. Please try again after 15 minutes.'
);

const messageLimiter = createLimiter(
  60 * 1000,
  30,
  'Message rate limit exceeded. Please slow down.'
);

module.exports = { authLimiter, apiLimiter, messageLimiter };

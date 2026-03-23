const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token required', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired. Please login again.', 401);
      }
      return sendError(res, 'Invalid token', 401);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 500);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };

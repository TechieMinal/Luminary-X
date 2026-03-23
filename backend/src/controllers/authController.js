const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === 'admin') {
      return sendError(res, 'Admin accounts cannot be created via registration', 403);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 'Email already registered', 409);

    const user = await User.create({ name, email, password, role });

    if (role === 'mentor') {
      await MentorProfile.create({ user: user._id });
      // Mentors must wait for approval — do not issue a token
      return sendSuccess(
        res,
        { requiresApproval: true },
        'Registration successful! Your mentor account is pending admin approval. You will be able to log in once approved.',
        201
      );
    }

    const token = generateToken(user._id);
    return sendSuccess(
      res,
      { token, user: user.toSafeObject() },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendError(res, 'Invalid email or password', 401);

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);

    // Block unapproved mentors from logging in
    if (user.role === 'mentor' && !user.isApproved) {
      return sendError(
        res,
        'Your mentor account is pending admin approval. Please check back later.',
        403
      );
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    return sendSuccess(res, { token, user: user.toSafeObject() }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', 404);

    let mentorProfile = null;
    if (user.role === 'mentor') {
      mentorProfile = await MentorProfile.findOne({ user: user._id }).select(
        'expertise currentRole company yearsOfExperience rating availableSlots'
      );
    }

    return sendSuccess(res, { user: user.toSafeObject(), mentorProfile }, 'User fetched');
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (avatar !== undefined) allowedUpdates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user: user.toSafeObject() }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }
    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };

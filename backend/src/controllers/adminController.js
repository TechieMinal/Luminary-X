const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const Project = require('../models/Project');
const Session = require('../models/Session');
const Message = require('../models/Message');
const Skill = require('../models/Skill');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// GET /api/admin/dashboard  (matches frontend: /admin/dashboard)
const getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalStudents, totalMentors,
      pendingMentors, totalProjects, totalSessions,
      completedSessions, totalMessages,
      newUsersThisMonth, newSessionsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'mentor', isApproved: false }),
      Project.countDocuments(),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Message.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, role: { $ne: 'admin' } }),
      Session.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt isApproved isActive');

    // Monthly growth for chart (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const monthlyData = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: { $ne: 'admin' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return sendSuccess(
      res,
      {
        stats: {
          totalUsers, totalStudents, totalMentors, pendingMentors,
          totalProjects, totalSessions, completedSessions, totalMessages,
          newUsersThisMonth, newSessionsThisMonth,
        },
        recentUsers,
        monthlyData,
      },
      'Dashboard stats fetched'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, search, isActive, isApproved } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    return sendPaginated(
      res,
      users,
      { total, page, limit, pages: Math.ceil(total / limit) },
      'Users fetched'
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/toggle-status  (matches frontend)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Cannot modify your own account', 400);
    }
    if (user.role === 'admin') {
      return sendError(res, 'Cannot modify admin accounts', 403);
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(
      res,
      { user: user.toSafeObject() },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Cannot delete your own account', 400);
    }
    if (user.role === 'admin') {
      return sendError(res, 'Cannot delete admin accounts', 403);
    }

    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'mentor') {
      await MentorProfile.findOneAndDelete({ user: req.params.id });
    }

    return sendSuccess(res, {}, 'User deleted');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/pending-mentors  (matches frontend)
const getPendingMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: 'mentor', isApproved: false })
      .sort({ createdAt: -1 })
      .select('-password');

    const withProfiles = await Promise.all(
      mentors.map(async (mentor) => {
        const profile = await MentorProfile.findOne({ user: mentor._id });
        return { ...mentor.toSafeObject(), mentorProfile: profile };
      })
    );

    return sendSuccess(res, withProfiles, 'Pending mentors fetched');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/approve  (matches frontend)
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'mentor') {
      return sendError(res, 'Mentor not found', 404);
    }

    user.isApproved = true;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { user: user.toSafeObject() }, 'Mentor approved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getPendingMentors,
  approveUser,
};

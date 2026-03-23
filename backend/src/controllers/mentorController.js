const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const Session = require('../models/Session');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// GET /api/mentors
const getAllMentors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { expertise, search } = req.query;

    const userFilter = { role: 'mentor', isActive: true, isApproved: true };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const mentorUsers = await User.find(userFilter).select('_id');
    const mentorIds = mentorUsers.map((u) => u._id);

    const profileFilter = { user: { $in: mentorIds } };
    if (expertise) profileFilter.expertise = { $in: [new RegExp(expertise, 'i')] };

    const total = await MentorProfile.countDocuments(profileFilter);
    const profiles = await MentorProfile.find(profileFilter)
      .populate('user', 'name email avatar bio')
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(
      res,
      profiles,
      { total, page, limit, pages: Math.ceil(total / limit) },
      'Mentors fetched'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/mentors/:id
const getMentorById = async (req, res, next) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.params.id })
      .populate('user', 'name email avatar bio createdAt')
      .populate('mentees', 'name avatar');

    if (!profile) return sendError(res, 'Mentor profile not found', 404);

    return sendSuccess(res, profile, 'Mentor fetched');
  } catch (error) {
    next(error);
  }
};

// GET /api/mentors/profile  (matches frontend: /mentors/profile)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.user._id })
      .populate('mentees', 'name email avatar');

    if (!profile) return sendError(res, 'Mentor profile not found', 404);

    return sendSuccess(res, profile, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

// PUT /api/mentors/profile  (matches frontend: /mentors/profile)
const updateMyProfile = async (req, res, next) => {
  try {
    const {
      expertise, yearsOfExperience, currentRole,
      company, linkedIn, website, availableSlots, sessionRate,
    } = req.body;

    const allowedUpdates = {};
    if (expertise !== undefined) allowedUpdates.expertise = expertise;
    if (yearsOfExperience !== undefined) allowedUpdates.yearsOfExperience = Number(yearsOfExperience);
    if (currentRole !== undefined) allowedUpdates.currentRole = currentRole;
    if (company !== undefined) allowedUpdates.company = company;
    if (linkedIn !== undefined) allowedUpdates.linkedIn = linkedIn;
    if (website !== undefined) allowedUpdates.website = website;
    if (availableSlots !== undefined) allowedUpdates.availableSlots = Number(availableSlots);
    if (sessionRate !== undefined) allowedUpdates.sessionRate = Number(sessionRate);

    const profile = await MentorProfile.findOneAndUpdate(
      { user: req.user._id },
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate('mentees', 'name email avatar');

    if (!profile) return sendError(res, 'Mentor profile not found', 404);

    return sendSuccess(res, profile, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

// GET /api/mentors/profile/mentees  (matches frontend)
const getMyMentees = async (req, res, next) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.user._id })
      .populate('mentees', 'name email avatar bio createdAt');

    if (!profile) return sendError(res, 'Mentor profile not found', 404);

    return sendSuccess(res, profile.mentees, 'Mentees fetched');
  } catch (error) {
    next(error);
  }
};

// GET /api/mentors/profile/sessions  (matches frontend)
const getMyMentorSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { mentor: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const total = await Session.countDocuments(filter);
    const sessions = await Session.find(filter)
      .populate('student', 'name avatar email')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginated(
      res,
      sessions,
      { total, page, limit, pages: Math.ceil(total / limit) },
      'Sessions fetched'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  getMyProfile,
  updateMyProfile,
  getMyMentees,
  getMyMentorSessions,
};

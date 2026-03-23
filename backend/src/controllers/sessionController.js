const Session = require('../models/Session');
const MentorProfile = require('../models/MentorProfile');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// GET /api/sessions/my  — student's own sessions (matches frontend)
const getMySessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = req.user.role === 'mentor'
      ? { mentor: req.user._id }
      : { student: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const total = await Session.countDocuments(filter);
    const sessions = await Session.find(filter)
      .populate('mentor', 'name avatar email')
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

// POST /api/sessions  — book a session (student only)
const bookSession = async (req, res, next) => {
  try {
    const { mentorId, title, description, scheduledAt, duration } = req.body;

    if (!mentorId || !title || !scheduledAt) {
      return sendError(res, 'Mentor, title, and scheduled date are required', 400);
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return sendError(res, 'Invalid scheduled date', 400);
    }
    if (scheduledDate < new Date()) {
      return sendError(res, 'Scheduled date must be in the future', 400);
    }

    const mentorProfile = await MentorProfile.findOne({ user: mentorId });
    if (!mentorProfile) return sendError(res, 'Mentor not found', 404);

    // Check for scheduling conflict
    const conflict = await Session.findOne({
      mentor: mentorId,
      scheduledAt: scheduledDate,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return sendError(res, 'Mentor already has a session at this time', 409);

    const session = await Session.create({
      mentor: mentorId,
      student: req.user._id,
      title,
      description: description || '',
      scheduledAt: scheduledDate,
      duration: duration || 60,
    });

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar');

    // Return flat session object — frontend doesn't use return value of requestSessionApi
    return sendSuccess(res, populated, 'Session requested successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/sessions/:id/status
const updateSessionStatus = async (req, res, next) => {
  try {
    const { status, meetingLink, notes } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return sendError(res, 'Session not found', 404);

    const isMentor = session.mentor.toString() === req.user._id.toString();
    const isStudent = session.student.toString() === req.user._id.toString();

    if (!isMentor && !isStudent) return sendError(res, 'Not authorized', 403);

    const validTransitions = {
      confirmed: isMentor && session.status === 'pending',
      completed: isMentor && session.status === 'confirmed',
      cancelled: (isMentor || isStudent) && ['pending', 'confirmed'].includes(session.status),
    };

    if (status && !validTransitions[status]) {
      return sendError(res, `Cannot transition session from "${session.status}" to "${status}"`, 400);
    }

    if (status) session.status = status;
    if (meetingLink !== undefined && isMentor) session.meetingLink = meetingLink;
    if (notes !== undefined && isMentor) session.notes = notes;

    if (status === 'completed') {
      const mentorProfile = await MentorProfile.findOne({ user: session.mentor });
      if (mentorProfile) {
        mentorProfile.totalSessions += 1;
        await mentorProfile.save();
      }
    }

    await session.save();

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar');

    return sendSuccess(res, populated, 'Session updated');
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/:id/rate  — student rates completed session
const rateSession = async (req, res, next) => {
  try {
    const { score, review } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return sendError(res, 'Session not found', 404);
    if (session.student.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the student can rate this session', 403);
    }
    if (session.status !== 'completed') {
      return sendError(res, 'Can only rate completed sessions', 400);
    }
    if (session.rating && session.rating.score) {
      return sendError(res, 'Session has already been rated', 409);
    }
    if (!score || score < 1 || score > 5) {
      return sendError(res, 'Rating score must be between 1 and 5', 400);
    }

    session.rating = { score: Number(score), review: review || '' };
    await session.save();

    // Recalculate mentor average rating
    const mentorProfile = await MentorProfile.findOne({ user: session.mentor });
    if (mentorProfile) {
      const ratedSessions = await Session.find({
        mentor: session.mentor,
        'rating.score': { $exists: true, $ne: null },
      });
      const avg = ratedSessions.reduce((sum, s) => sum + s.rating.score, 0) / ratedSessions.length;
      mentorProfile.rating.average = parseFloat(avg.toFixed(1));
      mentorProfile.rating.count = ratedSessions.length;
      await mentorProfile.save();
    }

    // Return flat session — frontend does: setSessions(prev => prev.map(s => s._id === id ? res.data.data : s))
    const populated = await Session.findById(session._id)
      .populate('mentor', 'name avatar')
      .populate('student', 'name avatar');

    return sendSuccess(res, populated, 'Session rated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMySessions, bookSession, updateSessionStatus, rateSession };

const express = require('express');
const router = express.Router();
const {
  getAllMentors,
  getMentorById,
  getMyProfile,
  updateMyProfile,
  getMyMentees,
  getMyMentorSessions,
} = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllMentors);

// IMPORTANT: /profile routes BEFORE /:id to prevent 'profile' being treated as an ID
router.get('/profile/mentees', authenticate, authorize('mentor'), getMyMentees);
router.get('/profile/sessions', authenticate, authorize('mentor'), getMyMentorSessions);
router.get('/profile', authenticate, authorize('mentor'), getMyProfile);
router.put('/profile', authenticate, authorize('mentor'), updateMyProfile);

router.get('/:id', authenticate, getMentorById);

module.exports = router;

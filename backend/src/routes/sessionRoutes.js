const express = require('express');
const router = express.Router();
const { getMySessions, bookSession, updateSessionStatus, rateSession } = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middleware/auth');

// IMPORTANT: /my must come before /:id
router.get('/my', authenticate, getMySessions);           // matches frontend: /sessions/my
router.post('/', authenticate, authorize('student'), bookSession);
router.put('/:id/status', authenticate, updateSessionStatus);
router.post('/:id/rate', authenticate, authorize('student'), rateSession);

module.exports = router;

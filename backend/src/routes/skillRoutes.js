const express = require('express');
const router = express.Router();
const {
  getMySkills,
  getUserSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  endorseSkill,
} = require('../controllers/skillController');
const { authenticate, authorize } = require('../middleware/auth');

// IMPORTANT: specific paths before /:id wildcard
router.get('/my', authenticate, getMySkills);               // matches frontend: /skills/my
router.get('/user/:userId', authenticate, getUserSkills);
router.post('/', authenticate, authorize('student'), addSkill);
router.put('/:id', authenticate, updateSkill);
router.delete('/:id', authenticate, deleteSkill);
router.post('/:id/endorse', authenticate, endorseSkill);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getMyProjects,
  getPublicProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

// IMPORTANT: specific paths before /:id wildcard
router.get('/my', authenticate, getMyProjects);           // matches frontend: /projects/my
router.get('/', authenticate, getPublicProjects);          // matches frontend: /projects (browse)
router.get('/:id', authenticate, getProjectById);
router.post('/', authenticate, authorize('student'), createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;

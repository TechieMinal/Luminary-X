const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getPendingMentors,
  approveUser,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);        // matches frontend: /admin/dashboard
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus); // matches frontend
router.put('/users/:id/approve', approveUser);            // matches frontend
router.delete('/users/:id', deleteUser);
router.get('/pending-mentors', getPendingMentors);        // matches frontend

module.exports = router;

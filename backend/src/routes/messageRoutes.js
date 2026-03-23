const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  searchUsers,
  deleteMessage,
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');

// IMPORTANT: specific routes BEFORE /:userId wildcard
router.get('/conversations', authenticate, getConversations);
router.get('/unread', authenticate, getUnreadCount);       // matches frontend: /messages/unread
router.get('/users', authenticate, searchUsers);           // matches frontend: /messages/users
router.get('/:userId', authenticate, getMessages);
router.post('/', authenticate, messageLimiter, sendMessage);
router.delete('/:id', authenticate, deleteMessage);

module.exports = router;

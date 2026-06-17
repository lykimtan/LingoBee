const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getCourseConversations,
  createPrivateConversation,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/conversationController');

// All routes are protected
router.use(authMiddleware);

// Get conversations for a specific course
router.get('/course/:courseId', getCourseConversations);

// Create a private conversation
router.post('/private', createPrivateConversation);

// Get messages for a conversation
router.get('/:conversationId/messages', getMessages);

// Send a new message
router.post('/:conversationId/messages', sendMessage);

// Mark conversation as read (Watermark pattern)
router.put('/:conversationId/read', markAsRead);

module.exports = router;

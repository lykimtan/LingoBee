const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Create feedback (Admin only)
router.post(
  '/',
  authMiddleware,
  isAdmin,
  feedbackController.createFeedback
);

// Get feedbacks for a video
router.get(
  '/video/:videoId',
  authMiddleware,
  feedbackController.getVideoFeedbacks
);

// Get feedbacks for a course
router.get(
  '/course/:courseId',
  authMiddleware,
  feedbackController.getCourseFeedbacks
);

// Update feedback status
router.patch(
  '/:id/status',
  authMiddleware,
  feedbackController.updateFeedbackStatus
);

module.exports = router;

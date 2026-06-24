const express = require('express');
const router = express.Router();
const {
  startTest,
  submitTest,
  getTestDetails,
  getMyTests,
  gradeSpeakingWithAI,
} = require('../controllers/placementTestController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All placement test routes require authentication
router.use(authMiddleware);

// Get user's tests
router.get('/my-tests', getMyTests);

// Start a new test
router.post('/start', startTest);

// Submit a test
router.post('/:id/submit', submitTest);

// Grade speaking with AI
router.post('/:id/grade-speaking', gradeSpeakingWithAI);

// Get specific test details
router.get('/:id', getTestDetails);

module.exports = router;

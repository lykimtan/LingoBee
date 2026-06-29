const express = require('express');
const { generatePath, getPath, getRecentActivities } = require('../controllers/learningPathController');
const { authMiddleware, authorize, isAdmin } = require('../middleware/authMiddleware');


const router = express.Router();

// Generate new learning path via AI
router.post('/generate', authMiddleware, generatePath);

// Get recent activities from learning paths
router.get('/activities/recent', authMiddleware, getRecentActivities);

// Get learning path for a course
router.get('/:courseId', authMiddleware, getPath);

module.exports = router;

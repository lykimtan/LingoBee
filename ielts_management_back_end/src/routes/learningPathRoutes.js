const express = require('express');
const { generatePath, getPath } = require('../controllers/learningPathController');
const { authMiddleware, authorize, isAdmin } = require('../middleware/authMiddleware');


const router = express.Router();

// Generate new learning path via AI
router.post('/generate', authMiddleware, generatePath);

// Get learning path for a course
router.get('/:courseId', authMiddleware, getPath);

module.exports = router;

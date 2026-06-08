const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getCourseLearningData,
  updateVideoProgress,
  getVideoResources,
  getExerciseForStudent,
  saveExerciseProgress,
  submitExerciseAttempt,
  gradeExerciseAttempt,
  getGradingQueue,
  getAttemptDetailForGrading,
  gradeSpeakingWithAI,
} = require('../controllers/learningController');

const router = express.Router();

// Get course data for learning interface
// Route: GET /api/learning/course/:slug
router.get('/course/:slug', authMiddleware, getCourseLearningData);

// Update video progress
// Route: PUT /api/learning/video/:videoId/progress
router.put('/video/:videoId/progress', authMiddleware, updateVideoProgress);

// Get video resources
// Route: GET /api/learning/video/:videoId/resources
router.get('/video/:videoId/resources', authMiddleware, getVideoResources);

// Get exercise for student
// Route: GET /api/learning/exercise/:exerciseId
router.get('/exercise/:exerciseId', authMiddleware, getExerciseForStudent);

// Save exercise progress
// Route: PUT /api/learning/exercise/:exerciseId/progress
router.put('/exercise/:exerciseId/progress', authMiddleware, saveExerciseProgress);

// Submit exercise attempt
// Route: POST /api/learning/exercise/:exerciseId/submit
router.post('/exercise/:exerciseId/submit', authMiddleware, submitExerciseAttempt);

// Grade speaking via AI
// Route: POST /api/learning/exercise/:exerciseId/grade-ai
router.post('/exercise/:exerciseId/grade-ai', authMiddleware, gradeSpeakingWithAI);

// Get grading queue (Teacher only)
// Route: GET /api/learning/teacher/grading-queue
router.get('/teacher/grading-queue', authMiddleware, getGradingQueue);

// Get attempt details for grading (Teacher only)
// Route: GET /api/learning/teacher/attempts/:attemptId
router.get('/teacher/attempts/:attemptId', authMiddleware, getAttemptDetailForGrading);

// Grade exercise attempt (Teacher only)
// Route: POST /api/learning/teacher/attempts/:attemptId/grade
router.post('/teacher/attempts/:attemptId/grade', authMiddleware, gradeExerciseAttempt);

module.exports = router;

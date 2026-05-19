const express = require('express');
const { authMiddleware, isTeacher } = require('../middleware/authMiddleware');
const {
  getVideoExercises,
  createVideoExercise,
  getExerciseById,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');

const router = express.Router();

// /api/exercises/video/:videoId
router.get('/video/:videoId', authMiddleware, isTeacher, getVideoExercises);
router.post('/video/:videoId', authMiddleware, isTeacher, createVideoExercise);

// /api/exercises/:exerciseId
router.get('/:exerciseId', authMiddleware, isTeacher, getExerciseById);
router.put('/:exerciseId', authMiddleware, isTeacher, updateExercise);
router.delete('/:exerciseId', authMiddleware, isTeacher, deleteExercise);

module.exports = router;

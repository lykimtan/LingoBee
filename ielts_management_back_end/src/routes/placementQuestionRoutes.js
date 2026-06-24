const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/placementQuestionController');

// All placement question routes require authentication
router.use(authMiddleware);

// Only admin and teacher can manage placement questions
router.use(authorize('admin', 'teacher'));

router
  .route('/')
  .post(createQuestion)
  .get(getQuestions);

router
  .route('/:id')
  .get(getQuestionById)
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;

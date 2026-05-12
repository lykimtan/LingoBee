const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, isAdmin, isTeacher } = require('../middleware/authMiddleware');
const {
  inviteTeacherToCourse,
  acceptCourseInvitation,
  rejectCourseInvitation,
  getMyCourseInvitations,
} = require('../controllers/courseInvitationController');
const {
  validate,
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseInvitation,
} = require('../middleware/validation');

// Public route - get all published courses
router.get('/public', courseController.getPublicCourses);

// Admin routes - requires authentication and admin role
router.post(
  '/',
  authMiddleware,
  isAdmin,
  validateCreateCourse,
  validate,
  courseController.createCourse
);
router.post(
  '/:id/invitations',
  authMiddleware,
  isAdmin,
  validateCourseInvitation,
  validate,
  inviteTeacherToCourse
);
router.get('/invitations', authMiddleware, isTeacher, getMyCourseInvitations);
router.get('/my', authMiddleware, isTeacher, courseController.getMyTeachingCourses);
router.get('/my/:slug', authMiddleware, isTeacher, courseController.getMyTeachingCourseBySlug);
router.get('/', authMiddleware, isAdmin, courseController.getAllCourses);
router.get('/:id', authMiddleware, isAdmin, courseController.getCourseById);
router.put(
  '/:id',
  authMiddleware,
  isTeacher,
  validateUpdateCourse,
  validate,
  courseController.updateCourse
);
router.delete('/:id', authMiddleware, isAdmin, courseController.deleteCourse);
router.post('/invitations/:id/accept', authMiddleware, isTeacher, acceptCourseInvitation);
router.post('/invitations/:id/reject', authMiddleware, isTeacher, rejectCourseInvitation);

module.exports = router;

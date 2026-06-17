const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, isAdmin, isTeacher } = require('../middleware/authMiddleware');
const {
  inviteTeacherToCourse,
  inviteAssistantToCourse,
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
router.get('/public/slug/:slug', courseController.getPublicCourseBySlug);

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
router.post(
  '/:id/assistants/invite',
  authMiddleware,
  isTeacher,
  validateCourseInvitation,
  validate,
  inviteAssistantToCourse
);
router.get('/invitations', authMiddleware, isTeacher, getMyCourseInvitations);
router.get('/my', authMiddleware, isTeacher, courseController.getMyTeachingCourses);
router.get('/my/:slug', authMiddleware, isTeacher, courseController.getMyTeachingCourseBySlug);
router.get('/', authMiddleware, isAdmin, courseController.getAllCourses);
router.get('/slug/:slug', authMiddleware, isAdmin, courseController.getAdminCourseBySlug);
router.get('/:id', authMiddleware, isAdmin, courseController.getCourseById);
router.get('/:id/students', authMiddleware, isTeacher, courseController.getCourseStudents);
router.put(
  '/:id',
  authMiddleware,
  isTeacher,
  validateUpdateCourse,
  validate,
  courseController.updateCourse
);
router.post('/:id/request-preview', authMiddleware, isTeacher, courseController.requestCoursePreview);
router.delete('/:id', authMiddleware, isAdmin, courseController.deleteCourse);
router.post('/invitations/:id/accept', authMiddleware, isTeacher, acceptCourseInvitation);
router.post('/invitations/:id/reject', authMiddleware, isTeacher, rejectCourseInvitation);

module.exports = router;

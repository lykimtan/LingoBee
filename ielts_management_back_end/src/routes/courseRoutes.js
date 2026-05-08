const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Public route - get all published courses
router.get('/public', courseController.getPublicCourses);

// Admin routes - requires authentication and admin role
router.post('/', authMiddleware, isAdmin, courseController.createCourse);
router.get('/', authMiddleware, isAdmin, courseController.getAllCourses);
router.get('/:id', authMiddleware, isAdmin, courseController.getCourseById);
router.put('/:id', authMiddleware, isAdmin, courseController.updateCourse);
router.delete('/:id', authMiddleware, isAdmin, courseController.deleteCourse);

module.exports = router;

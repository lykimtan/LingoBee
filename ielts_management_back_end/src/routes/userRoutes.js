const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorize, isAdmin } = require('../middleware/authMiddleware');

// Public routes (none for user management)

// Protected routes - require authentication
// Get user profile with related data (any authenticated user)
router.get('/profile', authMiddleware, userController.getUserProfile);

// Get user by ID (admin or self)
router.get('/:userId', authMiddleware, userController.getUserById);

// Update user (admin or self)
router.put('/:userId', authMiddleware, userController.updateUser);

// Admin-only routes
// Get student stats for admin
router.get('/students/admin/stats', authMiddleware, isAdmin, userController.getAdminStudentStats);

// Get students for admin
router.get('/students/admin', authMiddleware, isAdmin, userController.getAdminStudents);

// Get student detail 360 for admin
router.get('/students/admin/:userId/detail', authMiddleware, isAdmin, userController.getAdminStudentDetail);

// Upgrade student to teacher (admin only)
router.post('/students/admin/:userId/upgrade-to-teacher', authMiddleware, isAdmin, userController.upgradeToTeacher);

// Upgrade user to admin (admin only)
router.post('/students/admin/:userId/upgrade-to-admin', authMiddleware, isAdmin, userController.upgradeToAdmin);
router.post('/teachers/admin/:userId/upgrade-to-admin', authMiddleware, isAdmin, userController.upgradeToAdmin);
router.post('/:userId/upgrade-to-admin', authMiddleware, isAdmin, userController.upgradeToAdmin);

// Teacher Admin routes
// Get teacher stats for admin
router.get('/teachers/admin/stats', authMiddleware, isAdmin, userController.getAdminTeacherStats);

// Get teachers for admin
router.get('/teachers/admin', authMiddleware, isAdmin, userController.getAdminTeachers);

// Get teacher detail 360 for admin
router.get('/teachers/admin/:userId/detail', authMiddleware, isAdmin, userController.getAdminTeacherDetail);

// Downgrade teacher to student (admin only)
router.post('/teachers/admin/:userId/downgrade-to-student', authMiddleware, isAdmin, userController.downgradeToStudent);

// Get all users with filtering and pagination
router.get('/', authMiddleware, isAdmin, userController.getAllUsers);

// Delete user (admin only)
router.delete('/:userId', authMiddleware, isAdmin, userController.deleteUser);

// Block/suspend user (admin only)
router.post('/:userId/block', authMiddleware, isAdmin, userController.blockUser);

// Unblock/activate user (admin only)
router.post('/:userId/unblock', authMiddleware, isAdmin, userController.unblockUser);

// Search users (admin only)
router.get('/search/query', authMiddleware, isAdmin, userController.searchUsers);

// Search teachers (teacher only)
router.get('/teachers/search', authMiddleware, authorize('teacher'), userController.searchTeachers);

// Get user statistics (admin only)
router.get('/stats/overview', authMiddleware, isAdmin, userController.getUserStatistics);

module.exports = router;

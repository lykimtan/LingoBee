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

// Get user statistics (admin only)
router.get('/stats/overview', authMiddleware, isAdmin, userController.getUserStatistics);

module.exports = router;

const express = require('express');
const {
  validateRegister,
  validateLogin,
  validate,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
} = require('../middleware/validation');
const { authMiddleware, isStudent } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  register,
  verifyEmail,
  login,
  googleLogin,
  logout,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyPassword,
} = require('../controllers/authController');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', ...validateRegister, validate, register);

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
router.post('/verify-email', ...validateEmailVerification, validate, verifyEmail);

/**
 * POST /api/auth/login
 * User login with rate limiting
 */
router.post('/login', loginLimiter, ...validateLogin, validate, login);

/**
 * POST /api/auth/google
 * Google OAuth login
 */
router.post('/google', googleLogin);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
router.post('/refresh-token', refreshToken);

/**
 * POST /api/auth/request-password-reset
 * Request password reset email
 */
router.post(
  '/request-password-reset',
  ...validatePasswordResetRequest,
  validate,
  requestPasswordReset
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', ...validatePasswordReset, validate, resetPassword);

// ============================================
// PROTECTED ROUTES (Auth Required)
// ============================================

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile (name, avatar)
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authMiddleware, changePassword);

/**
 * POST /api/auth/logout
 * Logout user and clear cookies
 */
router.post('/logout', authMiddleware, logout);

/**
 * POST /api/auth/verify-password
 * Verify admin/user password for sensitive actions
 */
router.post('/verify-password', authMiddleware, verifyPassword);

module.exports = router;

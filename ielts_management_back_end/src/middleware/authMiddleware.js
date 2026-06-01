const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');
const { getValue, setWithTTL } = require('../config/redis');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header or cookies
 * Attaches user to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await getValue(
      `${process.env.REDIS_PREFIX || 'ielts:'}blacklist:${token}`
    );
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        errorCode: 'TOKEN_REVOKED',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in cache first
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const cacheKey = `${redisPrefix}user:${decoded.userId}`;
    let user = await getValue(cacheKey);

    if (!user) {
      user = await User.findById(decoded.userId).lean();
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      // Cache user for 30 minutes
      await setWithTTL(cacheKey, user, 1800);
    }

    // Check if token was issued before password change
    if (
      user.passwordChangedAt &&
      decoded.iat < Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please login again.',
      });
    }

    // Attach user to request
    user.id = user.id || (user._id ? user._id.toString() : null);
    req.user = user;
    logger.info(`User authenticated: ${user.email}`);

    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        errorCode: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errorCode: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Optional Authentication Middleware
 * Verifies token if provided, but doesn't require it
 */
const authMiddlewareOptional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in cache first
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const cacheKey = `${redisPrefix}user:${decoded.userId}`;
    let user = await getValue(cacheKey);

    if (!user) {
      user = await User.findById(decoded.userId).lean();
      if (user) {
        await setWithTTL(cacheKey, user, 1800);
      }
    }

    if (user) {
      user.id = user.id || (user._id ? user._id.toString() : null);
      req.user = user;
      logger.info(`User authenticated (optional): ${user.email}`);
    }

    next();
  } catch (error) {
    logger.warn(`Optional authentication failed: ${error.message}`);
    // Don't block request, just continue
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Usage: authorize('admin', 'teacher')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Student-only Authorization Middleware
 */
const isStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can access this resource',
    });
  }
  next();
};

/**
 * Teacher-only Authorization Middleware
 */
const isTeacher = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only teachers can access this resource',
    });
  }
  next();
};

/**
 * Admin-only Authorization Middleware
 */
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this resource',
    });
  }
  next();
};

// Legacy support for existing code
const verifyToken = authMiddleware;
const verifyTokenOptional = authMiddlewareOptional;

module.exports = {
  authMiddleware,
  authMiddlewareOptional,
  authorize,
  isStudent,
  isTeacher,
  isAdmin,
  // Legacy exports
  verifyToken,
  verifyTokenOptional,
};

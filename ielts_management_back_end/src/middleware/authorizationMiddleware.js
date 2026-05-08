const logger = require('../utils/logger');

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role to access route
 * Must be used AFTER verifyToken middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (set by verifyToken middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not authenticated',
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.id} (${req.user.role}) to access ${req.method} ${req.path}`
        );

        return res.status(403).json({
          success: false,
          message: `Forbidden: Only ${allowedRoles.join(', ')} can access this resource`,
          allowedRoles: allowedRoles,
          userRole: req.user.role,
        });
      }

      logger.info(
        `User ${req.user.id} (${req.user.role}) authorized for ${req.method} ${req.path}`
      );

      next();
    } catch (error) {
      logger.error(`Authorization check failed: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error: Authorization check failed',
      });
    }
  };
};

/**
 * Check if user is the owner of resource
 * Compares req.user.id with resourceOwnerId
 */
const authorizeOwner = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
    }

    // Get owner ID from params or body (customize based on your needs)
    const ownerId = req.params.userId || req.body.userId;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request: User ID not provided',
      });
    }

    // Check if current user is owner (or is Admin)
    if (req.user.id !== ownerId && req.user.role !== 'Admin') {
      logger.warn(`Owner check failed: User ${req.user.id} tried to access resource of ${ownerId}`);

      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only modify your own resources',
      });
    }

    logger.info(`Owner authorization passed for user ${req.user.id}`);
    next();
  } catch (error) {
    logger.error(`Owner authorization check failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Authorization check failed',
    });
  }
};

/**
 * Admin only middleware
 * Shorthand for authorize('Admin')
 */
const requireAdmin = authorize('Admin');

/**
 * Teacher or Admin middleware
 * Shorthand for authorize('Teacher', 'Admin')
 */
const requireTeacher = authorize('Teacher', 'Admin');

/**
 * Student or Admin middleware
 * Shorthand for authorize('Student', 'Admin')
 */
const requireStudent = authorize('Student', 'Admin');

module.exports = {
  authorize,
  authorizeOwner,
  requireAdmin,
  requireTeacher,
  requireStudent,
};

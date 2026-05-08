const { body, validationResult } = require('express-validator');

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

// User Registration Validation
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and numbers'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

// User Login Validation
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Email Verification Validation
const validateEmailVerification = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

// Password Reset Request Validation
const validatePasswordResetRequest = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

// Password Reset Validation
const validatePasswordReset = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and numbers'),
];

// Course Enrollment Validation
const validateEnrollment = [
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('priceTierId').notEmpty().withMessage('Price tier is required'),
];

// Payment Validation
const validatePayment = [
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('priceTier').notEmpty().withMessage('Price tier is required'),
  body('discountCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Invalid discount code format'),
];

// Exercise Submission Validation
const validateExerciseSubmission = [
  body('exerciseId').isMongoId().withMessage('Invalid exercise ID'),
  body('answers').isArray({ min: 1 }).withMessage('At least one answer is required'),
  body('answers.*.questionId').isMongoId().withMessage('Invalid question ID'),
];

// Mock Test Submission Validation
const validateMockTestSubmission = [
  body('mockTestId').isMongoId().withMessage('Invalid mock test ID'),
  body('answers').isArray({ min: 1 }).withMessage('At least one answer is required'),
];

// Message Validation
const validateMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message cannot be empty')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
];

// Course Creation Validation (Admin/Teacher only)
const validateCreateCourse = [
  body('title')
    .notEmpty()
    .withMessage('Course title is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Course description is required')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category').isIn(['topic', 'skill', 'level']).withMessage('Invalid category'),
  body('level').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).withMessage('Invalid level'),
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEnrollment,
  validatePayment,
  validateExerciseSubmission,
  validateMockTestSubmission,
  validateMessage,
  validateCreateCourse,
};

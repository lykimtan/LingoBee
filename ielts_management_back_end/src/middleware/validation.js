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
  body('category')
    .isIn(['speaking', 'listening', 'reading', 'writing', 'full-test', 'grammar', 'vocabulary'])
    .withMessage('Invalid category'),
  body('level').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).withMessage('Invalid level'),
  body('teacher').isMongoId().withMessage('Invalid teacher ID'),
  body('courseDetail')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Course detail is too long'),
  body('teachingAssistants')
    .optional()
    .isArray()
    .withMessage('Teaching assistants must be an array'),
  body('teachingAssistants.*').optional().isMongoId().withMessage('Invalid assistant ID'),
  body('priceTiers').optional().isArray().withMessage('Price tiers must be an array'),
  body('priceTiers.*.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid price tier name'),
  body('priceTiers.*.price').optional().isFloat({ min: 0 }).withMessage('Invalid price tier price'),
  body('priceTiers.*.description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invalid price tier description'),
  body('courseStartDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid start date'),
  body('courseEndDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (!value || !req.body.courseStartDate) return true;
      return new Date(value) >= new Date(req.body.courseStartDate);
    })
    .withMessage('End date must be on or after start date'),
  body('inviteMessage')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Invite message is too long'),
  body('publicInfo').optional().isObject().withMessage('Public info must be an object'),
  body('publicInfo.thumbnail').optional({ nullable: true }).isString().trim(),
  body('publicInfo.shortDescription').optional().isString().trim().isLength({ max: 500 }),
  body('publicInfo.targetLevel').optional().isString().trim().isLength({ max: 50 }),
  body('publicInfo.courseOverview').optional().isString().trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['draft', 'invited', 'accepted', 'review', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  body('totalStudents').optional().isInt({ min: 0 }).withMessage('Invalid total students'),
  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Invalid average rating'),
  body('totalReviews').optional().isInt({ min: 0 }).withMessage('Invalid total reviews'),
  body('durationInHours').optional().isFloat({ min: 0 }).withMessage('Invalid duration'),
  body('estimatedWeeks').optional().isInt({ min: 0 }).withMessage('Invalid estimated weeks'),
  body('promoVideoUrl').optional({ nullable: true }).isURL().withMessage('Invalid promo video URL'),
  body('isPublished').optional().isBoolean().withMessage('Invalid published flag'),
];

const validateUpdateCourse = [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['speaking', 'listening', 'reading', 'writing', 'full-test', 'grammar', 'vocabulary'])
    .withMessage('Invalid category'),
  body('level').optional().isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).withMessage('Invalid level'),
  body('teacher').optional().isMongoId().withMessage('Invalid teacher ID'),
  body('courseDetail')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Course detail is too long'),
  body('teachingAssistants')
    .optional()
    .isArray()
    .withMessage('Teaching assistants must be an array'),
  body('teachingAssistants.*').optional().isMongoId().withMessage('Invalid assistant ID'),
  body('priceTiers').optional().isArray().withMessage('Price tiers must be an array'),
  body('priceTiers.*.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid price tier name'),
  body('priceTiers.*.price').optional().isFloat({ min: 0 }).withMessage('Invalid price tier price'),
  body('priceTiers.*.description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invalid price tier description'),
  body('courseStartDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid start date'),
  body('courseEndDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (!value || !req.body.courseStartDate) return true;
      return new Date(value) >= new Date(req.body.courseStartDate);
    })
    .withMessage('End date must be on or after start date'),
  body('publicInfo').optional().isObject().withMessage('Public info must be an object'),
  body('publicInfo.thumbnail').optional({ nullable: true }).isString().trim(),
  body('publicInfo.shortDescription').optional().isString().trim().isLength({ max: 500 }),
  body('publicInfo.targetLevel').optional().isString().trim().isLength({ max: 50 }),
  body('publicInfo.courseOverview').optional().isString().trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['draft', 'invited', 'accepted', 'review', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  body('totalStudents').optional().isInt({ min: 0 }).withMessage('Invalid total students'),
  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Invalid average rating'),
  body('totalReviews').optional().isInt({ min: 0 }).withMessage('Invalid total reviews'),
  body('durationInHours').optional().isFloat({ min: 0 }).withMessage('Invalid duration'),
  body('estimatedWeeks').optional().isInt({ min: 0 }).withMessage('Invalid estimated weeks'),
  body('promoVideoUrl').optional({ nullable: true }).isURL().withMessage('Invalid promo video URL'),
  body('isPublished').optional().isBoolean().withMessage('Invalid published flag'),
];

const validateCourseInvitation = [
  body('teacherId').isMongoId().withMessage('Invalid teacher ID'),
  body('message')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message is too long'),
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
  validateUpdateCourse,
  validateCourseInvitation,
};

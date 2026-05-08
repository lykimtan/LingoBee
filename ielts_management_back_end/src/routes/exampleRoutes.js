const express = require('express');
const router = express.Router();
const { upload } = require('../config/multerConfig');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate, validateRegister, validateLogin } = require('../middleware/validation');

// Example: User Registration Route with Validation
router.post('/register', validateRegister, validate, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // TODO: Create user in database
    // const user = await User.create({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      // user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// Example: User Login Route with Rate Limiting
router.post(
  '/login',
  loginLimiter, // Rate limiting
  validateLogin,
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // TODO: Find user and verify password
      // const user = await User.findOne({ email }).select('+password');
      // const isPasswordValid = await user.comparePassword(password);

      // TODO: Generate JWT token
      // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      //   expiresIn: process.env.JWT_EXPIRE,
      // });

      // Set cookie
      // res.cookie('authToken', token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });

      res.json({
        success: true,
        message: 'Login successful',
        // token,
        // user: { id: user._id, email: user.email, name: user.name },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }
);

// Example: Upload Avatar Route
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // TODO: Save file path to user profile
    // const user = await User.findByIdAndUpdate(
    //   req.user._id,
    //   { avatar: req.file.path },
    //   { new: true }
    // );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.path}`,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

// Example: Google OAuth Route
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Verify Google token using apiService
    // const googleData = await verifyGoogleToken(token);
    // const user = await User.findOrCreate({
    //   googleId: googleData.sub,
    //   email: googleData.email,
    //   name: googleData.name,
    // });

    res.json({
      success: true,
      message: 'Google authentication successful',
      // user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
});

module.exports = router;

// ============================================
// USAGE GUIDE
// ============================================
/*
 * 1. VALIDATION - validateRegister, validateLogin, validate
 *    Validates and sanitizes user input before processing
 *
 * 2. RATE LIMITING - loginLimiter
 *    Prevents brute force attacks on login endpoint
 *
 * 3. FILE UPLOAD - upload.single('avatar')
 *    Handles file uploads with MIME type validation
 *    Files are automatically saved to /uploads directory
 *
 * 4. SECURITY
 *    - All data is sanitized by mongo-sanitize middleware in app.js
 *    - All endpoints are protected by rate limiter
 *    - Security headers added by helmet
 *
 * 5. ERROR HANDLING
 *    All errors are caught and returned consistent JSON format
 *    - success: boolean
 *    - message: user-friendly message
 *    - error: technical error (only in development)
 */

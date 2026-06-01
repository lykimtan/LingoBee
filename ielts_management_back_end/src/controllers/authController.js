const jwt = require('jsonwebtoken');
const { User, Student } = require('../models');
const logger = require('../utils/logger');
const {
  sendEmail,
  verifyGoogleToken,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} = require('../services/apiService');
const { setWithTTL, deleteKey } = require('../config/redis');
const { deleteCloudinaryAsset } = require('./uploadController');

// Generate JWT tokens
const generateTokens = (user) => {
  const userId = user?._id || user?.id || user;
  const role = user?.role;

  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

  return { accessToken, refreshToken };
};

// Set JWT token in cookie
const setAuthCookie = (res, token, name = 'authToken') => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ============================================
// USER REGISTRATION
// ============================================
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'student',
    });

    logger.info(`User registered: ${email}`);

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Save token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email (if email service is configured)
    if (process.env.EMAIL_SERVICE_KEY) {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(email, 'Verify Your Email', 'email_verification', {
        name,
        verificationUrl,
      });
    }

    // Create student profile
    await Student.create({
      userId: user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// EMAIL VERIFICATION
// ============================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find user with token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Invalidate user cache
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKey(`${redisPrefix}user:${user._id}`);

    logger.info(`Email verified: ${user.email}`);

    return res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// USER LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis (if available)
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const refreshTTL = 30 * 24 * 60 * 60; // 30 days in seconds
    await setWithTTL(
      `${redisPrefix}refresh:${refreshToken}`,
      {
        userId: user._id,
        email: user.email,
        issuedAt: new Date().toISOString(),
      },
      refreshTTL
    );

    // Set cookies
    setAuthCookie(res, accessToken, 'authToken');
    setAuthCookie(res, refreshToken, 'refreshToken');

    logger.info(`User logged in: ${email}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// GOOGLE LOGIN
// ============================================
const googleLogin = async (req, res) => {
  try {
    const { code, idToken } = req.body;

    if (!code && !idToken) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code or ID token is required',
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    let tokenToVerify = idToken;
    let tokenResponse;

    if (code) {
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

      if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
        return res.status(500).json({
          success: false,
          message: 'Google OAuth is not configured',
        });
      }

      tokenResponse = await exchangeGoogleCode(
        code,
        googleClientId,
        googleClientSecret,
        googleRedirectUri
      );

      tokenToVerify = tokenResponse?.id_token;
    }

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is missing',
      });
    }

    const tokenInfo = await verifyGoogleToken(tokenToVerify);
    if (googleClientId && tokenInfo.aud && tokenInfo.aud !== googleClientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token audience',
      });
    }

    const emailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === 'true';
    if (!tokenInfo.email || !emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Google account email is not verified',
      });
    }

    let googleProfile = null;
    if (tokenResponse?.access_token) {
      try {
        googleProfile = await fetchGoogleUserInfo(tokenResponse.access_token);
      } catch (profileError) {
        logger.warn(`Google profile fetch failed: ${profileError.message}`);
      }
    }

    const googleId = tokenInfo.sub;
    const displayName =
      googleProfile?.name ||
      tokenInfo.name ||
      tokenInfo.given_name ||
      tokenInfo.email.split('@')[0];

    let user = await User.findOne({
      $or: [{ googleId }, { email: tokenInfo.email }],
    });

    if (!user) {
      user = await User.create({
        email: tokenInfo.email,
        name: displayName,
        role: 'student',
        googleId,
        isEmailVerified: true,
      });

      await Student.create({
        userId: user._id,
      });
    } else {
      let updated = false;

      if (!user.googleId && googleId) {
        user.googleId = googleId;
        updated = true;
      }

      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const refreshTTL = 30 * 24 * 60 * 60; // 30 days in seconds

    await setWithTTL(
      `${redisPrefix}refresh:${refreshToken}`,
      {
        userId: user._id,
        email: user.email,
        issuedAt: new Date().toISOString(),
      },
      refreshTTL
    );

    setAuthCookie(res, accessToken, 'authToken');
    setAuthCookie(res, refreshToken, 'refreshToken');

    logger.info(`User logged in with Google: ${user.email}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    logger.error(`Google login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// REQUEST PASSWORD RESET
// ============================================
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        success: true,
        message: 'If email exists, password reset link will be sent',
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send password reset email
    if (process.env.EMAIL_SERVICE_KEY) {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail(email, 'Password Reset Request', 'password_reset', {
        name: user.name,
        resetUrl,
      });
    }

    logger.info(`Password reset requested: ${email}`);

    return res.json({
      success: true,
      message: 'If email exists, password reset link will be sent',
    });
  } catch (error) {
    logger.error(`Password reset request error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate user cache
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKey(`${redisPrefix}user:${user._id}`);

    logger.info(`Password reset: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// REFRESH ACCESS TOKEN
// ============================================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new tokens (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Invalidate old refresh token in Redis (if available)
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKey(`${redisPrefix}refresh:${token}`);

    // Store new refresh token in Redis with TTL (30 days)
    const refreshTTL = 30 * 24 * 60 * 60; // 30 days in seconds
    await setWithTTL(
      `${redisPrefix}refresh:${newRefreshToken}`,
      {
        userId: user._id,
        email: user.email,
        issuedAt: new Date().toISOString(),
      },
      refreshTTL
    );

    // Set cookies
    setAuthCookie(res, accessToken, 'authToken');
    setAuthCookie(res, newRefreshToken, 'refreshToken');

    logger.info(`Token refreshed for user: ${user.email}`);

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
  try {
    // Get tokens from headers/cookies to blacklist
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;
    const refreshTokenStr = req.body?.refreshToken || req.cookies?.refreshToken;

    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';

    // Blacklist access token (until expiry - 7 days)
    if (accessToken) {
      const accessTTL = 7 * 24 * 60 * 60; // 7 days
      await setWithTTL(
        `${redisPrefix}blacklist:${accessToken}`,
        {
          revokedAt: new Date().toISOString(),
        },
        accessTTL
      );
    }

    // Invalidate refresh token
    if (refreshTokenStr) {
      await deleteKey(`${redisPrefix}refresh:${refreshTokenStr}`);
    }

    // Clear cookies
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    logger.info('User logged out');

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
      },
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old avatar from Cloudinary if new avatar is provided
    if (avatar && user.avatar && avatar !== user.avatar) {
      await deleteCloudinaryAsset(user.avatar);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Invalidate user cache
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKey(`${redisPrefix}user:${userId}`);

    logger.info(`User profile updated: ${updatedUser.email}`);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        googleId: updatedUser.googleId,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate user cache
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKey(`${redisPrefix}user:${userId}`);

    logger.info(`Password changed: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
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
  generateTokens,
};

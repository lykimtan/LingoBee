const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { securityHeaders, sanitizeData } = require('./middleware/securityMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Security headers (Helmet)
app.use(securityHeaders);

// 2. CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// 3. Rate limiting on all API requests
app.use('/api/', apiLimiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

// Parse JSON and URL-encoded data
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Cookie parsing
app.use(cookieParser());

// ============================================
// SANITIZATION MIDDLEWARE
// ============================================

// Data sanitization (prevent NoSQL injection)
app.use(sanitizeData);

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============================================
// STATIC FILES
// ============================================

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ============================================
// Routes
// ============================================

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// TODO: Import and use additional routes
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));
// app.use('/api/mockTests', require('./routes/mockTestRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
// app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE (MUST BE LAST)
// ============================================

app.use(errorHandler);

module.exports = app;

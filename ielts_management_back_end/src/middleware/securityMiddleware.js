const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');

// Security Headers Middleware (Helmet)
const securityHeaders = helmet({
  contentSecurityPolicy: false, // ⚠️ Chỉ để test
});

// Data Sanitization Middleware
const sanitizeData = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  // Sanitize query parameters
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  // Sanitize URL parameters
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }
  next();
};

module.exports = {
  securityHeaders,
  sanitizeData,
};

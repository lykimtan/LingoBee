# Security & Utilities Integration Guide

## 📦 Installed Packages

✅ **cookie-parser** - HTTP cookie management
✅ **helmet** - Security headers
✅ **express-rate-limit** - Rate limiting
✅ **mongo-sanitize** - NoSQL injection prevention
✅ **express-validator** - Input validation & sanitization
✅ **multer** - File upload handling
✅ **axios** - HTTP requests to external APIs

---

## 🏗️ File Structure Created

```
src/
├── config/
│   └── multerConfig.js          # File upload configuration
├── middleware/
│   ├── rateLimiter.js           # Rate limiting rules
│   ├── validation.js            # Express-validator rules
│   ├── securityMiddleware.js    # Helmet & mongo-sanitize
│   └── errorHandler.js          # (existing)
├── services/
│   └── apiService.js            # Axios client & external APIs
├── routes/
│   └── exampleRoutes.js         # Example implementation
├── app.js                       # (UPDATED - integrated all middleware)
└── server.js                    # (existing)

.env.example                      # Environment variables template
```

---

## 🔒 Security Features Implemented

### 1. **Helmet - Security Headers**

Protects against:

- XSS (Cross-Site Scripting)
- Clickjacking
- MIME-type sniffing
- Missing Content Security Policy

**Where**: `src/middleware/securityMiddleware.js`

### 2. **Mongo-Sanitize - NoSQL Injection Prevention**

Removes dangerous characters from all inputs:

```javascript
// Before: { email: { $ne: "anything" } }
// After:  { email: "cleaned_value" }
```

**Where**: Automatically applied in `app.js`

### 3. **Express-Validator - Input Validation**

Validates & sanitizes user input:

- Email format
- Password strength
- Name length
- Custom rules for all endpoints

**Where**: `src/middleware/validation.js`

### 4. **Express-Rate-Limit - Rate Limiting**

Three tiers of limiting:

- **Login**: 5 attempts per 15 minutes
- **API**: 100 requests per 15 minutes
- **Payment**: 10 attempts per 10 minutes

**Where**: `src/middleware/rateLimiter.js`

### 5. **Cookie-Parser - Secure Session Management**

- HttpOnly cookies (prevent XSS)
- Secure flag in production
- SameSite protection

---

## 📤 File Upload System

### Features:

- **Size limit**: 50MB per file
- **Type validation**: MIME type checking
- **Organization**: Separate folders for avatars & attachments
- **Secure naming**: Unique filenames to prevent overwrites

### Allowed file types:

```
Avatars:      JPEG, PNG, GIF, WebP
Attachments:  Images, PDF, Word, Excel, Text
```

### Usage:

```javascript
// Single file upload
router.post('/upload', upload.single('avatar'), handler);

// Multiple files
router.post('/upload-multiple', upload.array('files', 5), handler);
```

**Where**: `src/config/multerConfig.js`

---

## 🌐 External API Integration (Axios)

### Services Included:

1. **Google OAuth**

   ```javascript
   const googleData = await verifyGoogleToken(token);
   const data = await exchangeGoogleCode(code, clientId, clientSecret);
   ```

2. **Payment Transactions**

   ```javascript
   const transaction = await createPaymentTransaction(paymentData);
   const verified = await verifyPaymentTransaction(transactionId);
   ```

3. **Email Service**

   ```javascript
   await sendEmail(email, subject, template, variables);
   ```

4. **SMS (Optional)**
   ```javascript
   await sendSMS(phoneNumber, message);
   ```

**Where**: `src/services/apiService.js`

### Features:

- Request/response logging
- Automatic timeout handling
- Error handling
- Request interceptors for auth headers

---

## ✅ Validation Rules Included

| Route               | Validation                       |
| ------------------- | -------------------------------- |
| `/register`         | Email, Strong password, Name     |
| `/login`            | Valid email, Password required   |
| `/courses/enroll`   | Valid course ID, Price tier      |
| `/payments`         | Amount validation, Discount code |
| `/exercises/submit` | Exercise ID, Answer format       |
| `/messages`         | Message length (1-5000 chars)    |
| `/upload`           | File size, MIME type             |

**Where**: `src/middleware/validation.js`

---

## 🚀 How Everything Works Together

### Request Flow:

```
1. Request arrives
2. Helmet adds security headers
3. CORS check
4. Rate limiter (rejects if exceeded)
5. Body parser
6. Cookie parser
7. Mongo-sanitize (cleans input)
8. Validation middleware (checks format)
9. Route handler (business logic)
10. Response sent
```

### Example Route Implementation:

```javascript
const express = require('express');
const router = express.Router();
const { validate, validateRegister } = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/multerConfig');

// Register with validation
router.post(
  '/register',
  validateRegister, // Validation rules
  validate, // Check validation results
  async (req, res) => {
    // Business logic here
    // req.body is already cleaned & validated
  }
);

// Login with rate limiting
router.post(
  '/login',
  loginLimiter, // Rate limit: 5/15min
  validateLogin, // Validation
  validate,
  async (req, res) => {}
);

// Upload with file validation
router.post(
  '/avatar',
  upload.single('avatar'), // File validation
  async (req, res) => {
    // req.file contains upload details
  }
);
```

---

## 🔧 Configuration

### Environment Variables (.env)

```
# Security
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Payment
PAYMENT_API_URL=https://...
PAYMENT_API_KEY=xxx

# Email
EMAIL_SERVICE_KEY=xxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Template**: `.env.example`

---

## 📍 Integration Checklist

- [x] Helmet security headers
- [x] Mongo-sanitize XSS protection
- [x] Cookie parser
- [x] Rate limiters (3 levels)
- [x] Express-validator rules (12 types)
- [x] Multer file upload (2 types)
- [x] Axios API client with interceptors
- [x] Google OAuth integration
- [x] Payment gateway integration
- [x] Email service integration
- [x] Error handling
- [x] Request logging
- [x] CORS configuration
- [x] Static file serving for uploads

---

## 🐛 Testing Endpoints

### 1. Test Rate Limiting

```bash
# This should work
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# After 5 attempts in 15 min, you'll get 429 (Too Many Requests)
```

### 2. Test File Upload

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "avatar=@/path/to/image.jpg"
```

### 3. Test Validation

```bash
# Invalid email should return 400
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"weak"}'
```

---

## 📚 Useful Links

- [Helmet docs](https://helmetjs.github.io/)
- [Express-validator docs](https://express-validator.github.io/docs/)
- [Multer docs](https://github.com/expressjs/multer)
- [Axios docs](https://axios-http.com/)
- [OWASP Web Security](https://owasp.org/)

---

## ⚠️ Important Security Notes

1. **Never commit `.env`** - Use `.env.example` template
2. **Enable HTTPS in production** - Set `COOKIE_SECURE=true`
3. **Rotate JWT secret regularly** - Don't hardcode in code
4. **Monitor rate limiter hits** - Indicates potential attacks
5. **Validate ALL user input** - Don't trust client-side validation
6. **Keep dependencies updated** - Run `npm audit` regularly

---

## 🎯 Next Steps

1. Copy `.env.example` to `.env` and fill in real values
2. Update route files with actual database operations
3. Test each endpoint thoroughly
4. Deploy to staging first
5. Monitor logs for security events

---

**Status**: ✅ **Full Integration Complete**
**Date**: April 8, 2026

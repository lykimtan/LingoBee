# Authentication System Implementation

## ✅ Files Created

### 1. **authController.js** - Authentication Business Logic

- User registration
- Email verification
- User login
- Password reset (request & reset)
- JWT token refresh
- Logout
- Get current user profile
- Update user profile
- Change password

### 2. **authMiddleware.js** - JWT Verification & Authorization

- `authMiddleware` - Verify JWT token
- `authMiddlewareOptional` - Optional JWT verification
- `authorize(...roles)` - Role-based authorization
- `isStudent` - Student-only access
- `isTeacher` - Teacher/Admin-only access
- `isAdmin` - Admin-only access

### 3. **authRoutes.js** - API Endpoints

Complete routing with validation and rate limiting

---

## 📡 API Endpoints

### PUBLIC ROUTES (No Authentication Required)

#### 1. **Register User**

```
POST /api/auth/register

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 2. **Verify Email**

```
POST /api/auth/verify-email

Body:
{
  "token": "jwt_token_from_email"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### 3. **Login**

```
POST /api/auth/login

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student",
      "avatar": null
    }
  }
}

Cookies Set:
- authToken (JWT access token)
- refreshToken (JWT refresh token)
```

#### 4. **Refresh Token**

```
POST /api/auth/refresh-token

Body:
{
  "refreshToken": "jwt_refresh_token"
}

Response (200):
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### 5. **Request Password Reset**

```
POST /api/auth/request-password-reset

Body:
{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "If email exists, password reset link will be sent"
}

Note: Email service required (configured in .env)
```

#### 6. **Reset Password**

```
POST /api/auth/reset-password

Body:
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### PROTECTED ROUTES (Authentication Required)

#### 7. **Get Current User**

```
GET /api/auth/me

Headers:
Authorization: Bearer <accessToken>
or
Cookie: authToken=<accessToken>

Response (200):
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "isEmailVerified": true,
    "status": "active"
  }
}
```

#### 8. **Update Profile**

```
PUT /api/auth/profile

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

#### 9. **Change Password**

```
POST /api/auth/change-password

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "currentPassword": "SecurePass123",
  "newPassword": "AnotherPass123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 10. **Logout**

```
POST /api/auth/logout

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔐 Authentication Flow

### Registration & Email Verification

```
1. User calls POST /api/auth/register
   ├─ Validation checks email/password format
   ├─ Check if email already exists
   ├─ Hash password with bcrypt
   ├─ Create User record
   ├─ Generate email verification token (24h expiry)
   ├─ Create Student profile
   ├─ Send verification email (if configured)
   └─ Return user data

2. User receives email with verification link
   └─ Contains token in URL

3. User calls POST /api/auth/verify-email with token
   ├─ Find user with valid token & not expired
   ├─ Mark isEmailVerified = true
   ├─ Clear verification token
   └─ Return success
```

### Login & Token Generation

```
1. User calls POST /api/auth/login with email/password
   ├─ Find user by email
   ├─ Compare password with hashed password (bcrypt)
   ├─ Check if email is verified
   ├─ Check if account is active
   ├─ Generate JWT access token (7 days)
   ├─ Generate JWT refresh token (30 days)
   ├─ Set cookies (httpOnly, secure in production)
   └─ Return tokens & user data

2. Frontend stores tokens and includes in requests
   └─ Authorization: Bearer <accessToken>
   └─ Or automatic by browser cookies

3. Backend validates token on protected routes
   ├─ Verify JWT signature
   ├─ Check token expiry
   ├─ Find user
   ├─ Check if password was changed after token issued
   ├─ Attach user to req.user
   └─ Proceed to handler
```

### Password Reset Flow

```
1. User calls POST /api/auth/request-password-reset
   ├─ Find user by email
   ├─ Generate reset token (1h expiry)
   ├─ Save token to user record
   ├─ Send reset email (if configured)
   └─ Return generic success message

2. User receives email with reset link
   └─ Contains reset token in URL

3. User calls POST /api/auth/reset-password with token
   ├─ Find user with valid token & not expired
   ├─ Hash new password
   ├─ Update password
   ├─ Update passwordChangedAt
   ├─ Clear reset token
   └─ Return success

4. Next login requires new password
```

---

## 🛡️ Security Features

### Password Security

- ✅ Minimum 6 characters (can be configured)
- ✅ Must contain uppercase, lowercase, numbers
- ✅ Hashed with bcrypt (10 salt rounds)
- ✅ Never returned in API responses
- ✅ Compared with bcrypt during login

### Token Security

- ✅ JWT signed with secret key
- ✅ Access token: 7 days expiry
- ✅ Refresh token: 30 days expiry
- ✅ Tokens cannot be used if password changed after issue
- ✅ Set in httpOnly cookies (secure in production)
- ✅ Also returned in response for flexibility

### Email Verification

- ✅ Token expires in 24 hours
- ✅ Must verify email before login
- ✅ Prevents fake email registrations

### Rate Limiting

- ✅ Login endpoint limited to 5 attempts per 15 minutes
- ✅ All API routes limited to 100 requests per 15 minutes

### Authorization

- ✅ Role-based access control
- ✅ Middleware for role checking
- ✅ Separate permissions for students/teachers/admins

---

## 🧪 Testing the Auth System

### 1. Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 3. Test Protected Route (with token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Test Rate Limiting (login)

```bash
# Run this 6 times in 15 minutes
# 6th request should get 429 Too Many Requests
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

---

## 📋 Validation Rules

| Field    | Rules                                             |
| -------- | ------------------------------------------------- |
| email    | Must be valid email format, max 255 chars         |
| password | Min 6 chars, require uppercase, lowercase, number |
| name     | 2-50 characters, required                         |
| token    | Required, non-empty                               |

---

## 🔍 Error Responses

### Invalid Credentials (401)

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Email Not Verified (403)

```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

### Account Not Active (403)

```json
{
  "success": false,
  "message": "Your account is not active"
}
```

### Token Expired (401)

```json
{
  "success": false,
  "message": "Token expired",
  "errorCode": "TOKEN_EXPIRED"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

---

## 📚 Usage in Other Controllers

### Use authMiddleware

```javascript
const { authMiddleware, authorize, isTeacher } = require('../middleware/authMiddleware');

// Require authentication
router.get('/profile', authMiddleware, handler);

// Require specific roles
router.post('/course', authMiddleware, authorize('teacher', 'admin'), handler);

// Require teacher role
router.put('/course/:id', authMiddleware, isTeacher, handler);
```

### Access user in controller

```javascript
const handler = async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const userRole = req.user.role;
};
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRE=30d

# Email Service (for verification & reset)
EMAIL_SERVICE_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_SERVICE_KEY=your_api_key
SENDER_EMAIL=noreply@yourapp.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Security
COOKIE_SECURE=false  # true in production
COOKIE_HTTP_ONLY=true
```

---

## 🚀 Next Steps

With authentication working, next features to implement:

1. **Course Management**
   - Get courses
   - Create courses
   - Enroll in courses
   - Check enrollment before accessing content

2. **Video Management**
   - Upload/stream videos
   - Track progress
   - Enforce order

3. **Exercise System**
   - Submit exercises
   - Auto-grade
   - Save results

4. **Payment Processing**
   - Create payment records
   - Verify payment
   - Unlock courses

5. **Messaging System**
   - WebSocket for real-time
   - Save messages
   - Mark as read

---

## 📝 File Structure

```
src/
├── controllers/
│   └── authController.js       ✅ DONE
├── middleware/
│   ├── authMiddleware.js       ✅ DONE
│   ├── validation.js           ✅ DONE
│   ├── rateLimiter.js          ✅ DONE
│   └── errorHandler.js
├── routes/
│   ├── authRoutes.js           ✅ DONE
│   └── ...
└── models/
    ├── User.js                ✅ READY
    └── Student.js             ✅ READY
```

---

**Status**: ✅ **Authentication System Complete!**
**Date**: April 17, 2026

You can now test all auth endpoints. Ready for next phase?

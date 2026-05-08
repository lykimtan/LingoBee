# User Controller API Documentation

## 📋 Overview

The **User Controller** provides comprehensive user management functionality for admin users and regular users. It complements the authentication system with user CRUD operations, profile management, and admin statistics.

### Distinction from Auth Controller

- **Auth Controller**: Handles authentication (register, login, password reset, email verification)
- **User Controller**: Handles user management (CRUD, profile viewing, admin operations)

---

## 🔐 Access Control

| Route                             | Authentication | Authorization | Notes            |
| --------------------------------- | -------------- | ------------- | ---------------- |
| `GET /api/users/profile`          | ✅ Required    | Any user      | Own profile only |
| `GET /api/users/:userId`          | ✅ Required    | Admin or self | Get user details |
| `PUT /api/users/:userId`          | ✅ Required    | Admin or self | Update user info |
| `GET /api/users`                  | ✅ Required    | Admin only    | Get all users    |
| `DELETE /api/users/:userId`       | ✅ Required    | Admin only    | Delete user      |
| `POST /api/users/:userId/block`   | ✅ Required    | Admin only    | Suspend user     |
| `POST /api/users/:userId/unblock` | ✅ Required    | Admin only    | Activate user    |
| `GET /api/users/search?query=...` | ✅ Required    | Admin only    | Search users     |
| `GET /api/users/stats/overview`   | ✅ Required    | Admin only    | Get statistics   |

---

## 📡 API Endpoints

### 1. Get User Profile

Returns authenticated user's full profile with related data (student profile, enrolled courses, etc.)

```
GET /api/users/profile

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "student@example.com",
      "name": "Nguyễn Văn A",
      "avatar": "url",
      "role": "student",
      "status": "active",
      "isEmailVerified": true,
      "createdAt": "2026-04-17T10:00:00Z"
    },
    "student": {
      "_id": "...",
      "userId": "...",
      "targetIELTSScore": 7.5,
      "estimatedTestDate": "2026-06-15",
      "currentLevel": "Intermediate",
      "enrolledCourses": [
        {
          "_id": "...",
          "courseId": { "_id": "...", "title": "IELTS Pro", "description": "..." },
          "enrollmentDate": "2026-04-17",
          "progress": 45,
          "status": "active"
        }
      ],
      "mockTestHistory": []
    }
  }
}
```

---

### 2. Get User by ID

Retrieve specific user's public information (admin or self only)

```
GET /api/users/:userId

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "_id": "65f3a4b2c1d2e3f4g5h6i7j8",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "url",
      "role": "student",
      "status": "active",
      "isEmailVerified": true
    },
    "student": { ... }
  }
}
```

**Error Responses:**

- `404`: User not found
- `403`: Unauthorized (not admin or not self)

---

### 3. Update User

Update user information (name, avatar, or admin updates: role, status)

```
PUT /api/users/:userId

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "name": "Jane Doe",
  "avatar": "https://example.com/new-avatar.jpg"
}

Admin can also update:
{
  "name": "Jane Doe",
  "role": "teacher",         // 'student', 'teacher', 'staff', 'admin'
  "status": "suspended"      // 'active', 'inactive', 'suspended'
}

Response (200):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatar": "https://example.com/new-avatar.jpg",
      "role": "student",
      "status": "active"
    }
  }
}
```

---

### 4. Get All Users (Admin Only)

Retrieve all users with pagination, filtering, and search

```
GET /api/users?page=1&limit=10&role=student&status=active&search=john

Query Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 10)
- role: Filter by role (guest, student, teacher, staff, admin)
- status: Filter by status (active, inactive, suspended)
- search: Search by email or name

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "...",
        "email": "student1@example.com",
        "name": "Student One",
        "role": "student",
        "status": "active",
        "isEmailVerified": true,
        "createdAt": "2026-04-17T10:00:00Z"
      },
      ...
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "pages": 15
    }
  }
}
```

---

### 5. Delete User (Admin Only)

Delete a user entirely (also deletes student profile if exists)

```
DELETE /api/users/:userId

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "...",
    "email": "user@example.com"
  }
}
```

**Security Notes:**

- Cannot delete other admin accounts (except yourself)
- Deleting student also removes their Student profile

---

### 6. Block/Suspend User (Admin Only)

Suspend a user account (prevents login and access)

```
POST /api/users/:userId/block

Headers:
Authorization: Bearer <accessToken>

Body:
{
  "reason": "Violates community guidelines"
}

Response (200):
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "status": "suspended"
  }
}
```

**Security Notes:**

- Cannot block yourself
- Blocked user cannot login until unblocked

---

### 7. Unblock/Activate User (Admin Only)

Reactivate a suspended user account

```
POST /api/users/:userId/unblock

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "status": "active"
  }
}
```

---

### 8. Search Users (Admin Only)

Search users by email or name

```
GET /api/users/search/query?query=john&role=student&status=active

Query Parameters:
- query: Search term (minimum 2 characters) - searches email and name
- role: Optional role filter
- status: Optional status filter

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "Search results retrieved",
  "data": {
    "results": [
      {
        "_id": "...",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "student",
        "status": "active"
      },
      {
        "_id": "...",
        "email": "johnny@example.com",
        "name": "Jonathan Smith",
        "role": "teacher",
        "status": "active"
      }
    ],
    "count": 2
  }
}
```

**Configuration:**

- Max results: 20 per search
- Min query length: 2 characters

---

### 9. Get User Statistics (Admin Only)

View comprehensive user management statistics

```
GET /api/users/stats/overview

Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 450,
    "usersByRole": [
      { "_id": "student", "count": 350 },
      { "_id": "teacher", "count": 50 },
      { "_id": "admin", "count": 10 },
      { "_id": "staff", "count": 40 }
    ],
    "usersByStatus": [
      { "_id": "active", "count": 430 },
      { "_id": "suspended", "count": 15 },
      { "_id": "inactive", "count": 5 }
    ],
    "verifiedEmails": 420,
    "newUsersThisMonth": 45,
    "studentStatistics": {
      "totalStudents": 350,
      "avgCoursesEnrolled": 2.3,
      "avgMockTestsTaken": 1.8
    }
  }
}
```

---

## 🧪 Testing Examples

### Test 1: Get Your Own Profile

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <accessToken>"
```

### Test 2: Admin Get All Users

```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=5&role=student" \
  -H "Authorization: Bearer <adminAccessToken>"
```

### Test 3: Admin Search Users

```bash
curl -X GET "http://localhost:5000/api/users/search/query?query=john" \
  -H "Authorization: Bearer <adminAccessToken>"
```

### Test 4: Admin Suspend User

```bash
curl -X POST http://localhost:5000/api/users/65f3a4b2c1d2e3f4g5h6i7j8/block \
  -H "Authorization: Bearer <adminAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Violation"}'
```

### Test 5: Update Own Profile

```bash
curl -X PUT http://localhost:5000/api/users/65f3a4b2c1d2e3f4g5h6i7j8 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "avatar": "url"}'
```

### Test 6: Get User Statistics

```bash
curl -X GET http://localhost:5000/api/users/stats/overview \
  -H "Authorization: Bearer <adminAccessToken>"
```

---

## 📊 User Status Lifecycle

```
Registration
    ↓
active (default)
    ├─ Can login, access courses
    ├─ suspended (admin blocked)
    │   └─ Cannot login or access
    │   └─ admin unblock → active
    └─ inactive (optional admin action)
        └─ Cannot login (can't auto-block)
```

---

## 🛡️ Security Features

### Authorization

- ✅ Role-based access control (admin vs non-admin)
- ✅ User can only view/edit own profile (unless admin)
- ✅ Cannot edit role/status as regular user
- ✅ Cannot block yourself
- ✅ Cannot delete other admins

### Data Privacy

- ✅ Passwords and tokens never returned
- ✅ Email verification tokens excluded from responses
- ✅ Password reset tokens excluded from responses

### Rate Limiting

- ✅ All user endpoints limited to 100 requests per 15 minutes

---

## 🔍 Common Use Cases

### Admin Dashboard

```javascript
// 1. Get overview statistics
GET /api/users/stats/overview

// 2. Get all active students
GET /api/users?role=student&status=active&limit=50

// 3. Search specific student
GET /api/users/search/query?query=john

// 4. Suspend problematic user
POST /api/users/:userId/block

// 5. View user details
GET /api/users/:userId
```

### Student Self-Service

```javascript
// 1. View own profile
GET /api/users/profile

// 2. Update profile
PUT /api/users/:userId

// 3. View enrollment history (in student profile)
GET /api/users/profile
  → student.enrolledCourses
  → student.mockTestHistory
```

### Integration with Auth

```javascript
// After login at POST /api/auth/login:
// 1. Frontend stores accessToken
// 2. Frontend can fetch detailed profile:
GET /api/users/profile
  → Returns full user + student data

// 3. If user is admin, fetch dashboard data:
GET /api/users/stats/overview
```

---

## 📁 File Structure

```
src/
├── controllers/
│   ├── authController.js    ✅ Authentication
│   └── userController.js    ✅ User Management (NEW)
├── routes/
│   ├── authRoutes.js        ✅ Auth endpoints
│   └── userRoutes.js        ✅ User endpoints (NEW)
└── models/
    └── User.js              ✅ User schema
```

---

## 🚀 Next Steps

With user management complete:

1. **Course Management** - Create, read, enroll students
2. **Video Management** - Upload, stream, track progress
3. **Exercise System** - Submit, grade, track results
4. **Payment Processing** - Payment records, verification
5. **Messaging System** - WebSocket chat, real-time notifications

---

**Status**: ✅ **User Controller Complete!**
**Date**: April 17, 2026

All user management endpoints are ready for testing and integration with frontend.

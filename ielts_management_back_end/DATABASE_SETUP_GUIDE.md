# Database Connection & Next Steps Guide

## ✅ Database Connection - HOÀN THÀNH

Database configuration đã được thiết lập với Mongoose. Dưới đây là hướng dẫn chi tiết.

---

## 📋 **Bước 1: Chuẩn Bị MongoDB**

### Option A: MongoDB Local

```bash
# Cài MongoDB trên máy nếu chưa có
# macOS (dùng Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Khởi động MongoDB service
brew services start mongodb-community
# hoặc
mongod

# Verify MongoDB đang chạy
mongo
# Hoặc dùng mongosh (MongoDB Shell mới)
mongosh
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản (hoặc đăng nhập)
3. Tạo project mới
4. Create a cluster
5. Tạo database user + password
6. Whitelist IP (allow access from anywhere: 0.0.0.0/0)
7. Copy connection string

---

## 🔐 **Bước 2: Cấu Hình Environment Variables (.env)**

File `.env` đã được tạo. Hãy sửa các thông tin sau:

### MongoDB Connection:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ielts_management

# hoặc MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/ielts_management?retryWrites=true&w=majority
```

### JWT Secret (QUAN TRỌNG):

```env
# Thay thế bằng secret keys mạnh
JWT_SECRET=your_secure_random_string_at_least_32_chars_long
JWT_REFRESH_SECRET=another_secure_random_string_at_least_32_chars
```

### Google OAuth (Nếu cần):

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# Get từ: https://console.cloud.google.com/
```

### CORS Origins (Frontend URLs):

```env
# Thêm URLs của frontend app của bạn
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

---

## 🧪 **Bước 3: Test Database Connection**

### Cách 1: Start Server

```bash
npm run dev
```

**Kết quả thành công:**

```
> ielts_management_back_end@1.0.0 dev
> nodemon server.js

[INFO] MongoDB connected successfully: localhost
[INFO] Server running on port 5000
```

### Cách 2: Test Kết Nối Trực Tiếp

Tạo file `test-db.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Kiểm tra collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(
      'Collections:',
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log('✅ Disconnected');
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

testConnection();
```

Run:

```bash
node test-db.js
```

---

## 📊 **Database Schema - Các Collections Được Tạo Tự Động**

Khi server chạy và data được insert, Mongoose sẽ tự tạo:

```
✓ users
✓ students
✓ courses
✓ videos
✓ exercises
✓ mocktests
✓ submissions
✓ learningpaths
✓ messages
✓ payments
✓ discountcodes
✓ videoprogresses
✓ notifications
```

Kiểm tra bằng MongoDB client:

```bash
# Trong mongosh hoặc MongoDB Compass
use ielts_management
db.getCollectionNames()
```

---

## 🚀 **Bước 4: Các Bước Tiếp Theo (Roadmap)**

### Phase 1: Authentication & User Management

**Tạo Controllers & Routes cho:**

1. ✅ User Registration
2. ✅ User Login
3. ✅ Email Verification
4. ✅ Password Reset
5. ✅ Google OAuth Login
6. ✅ JWT Token Refresh

**Files cần tạo:**

- `src/controllers/authController.js`
- `src/routes/authRoutes.js`
- `src/middleware/authMiddleware.js` (JWT verification)

---

### Phase 2: Course Management

**Tạo CRUD operations cho:**

1. ✅ Get all courses (public)
2. ✅ Get course details (public info only)
3. ✅ Create course (admin/teacher only)
4. ✅ Update course
5. ✅ Delete course
6. ✅ Enroll student in course
7. ✅ Get enrolled courses for student

**Files cần tạo:**

- `src/controllers/courseController.js`
- `src/routes/courseRoutes.js`
- `src/services/courseService.js`

---

### Phase 3: Video & Learning Path

**Implement:**

1. ✅ Video upload/management
2. ✅ Video progress tracking
3. ✅ Video order enforcement
4. ✅ Generate learning path (AI recommendation)
5. ✅ Daily task notifications

**Files cần tạo:**

- `src/controllers/videoController.js`
- `src/routes/videoRoutes.js`
- `src/services/learningPathService.js`

---

### Phase 4: Exercises & Tests

**Implement:**

1. ✅ Exercise submission & grading
2. ✅ Mock test creation & management
3. ✅ Test result analysis
4. ✅ Score calculation

**Files cần tạo:**

- `src/controllers/exerciseController.js`
- `src/controllers/mockTestController.js`
- `src/routes/exerciseRoutes.js`
- `src/routes/mockTestRoutes.js`

---

### Phase 5: Payments & Enrollment

**Implement:**

1. ✅ Payment gateway integration
2. ✅ Discount code validation
3. ✅ Invoice generation
4. ✅ Payment verification

**Files cần tạo:**

- `src/controllers/paymentController.js`
- `src/routes/paymentRoutes.js`
- `src/services/paymentService.js`

---

### Phase 6: Chat & Notifications

**Implement:**

1. ✅ WebSocket for real-time messages
2. ✅ Message CRUD operations
3. ✅ Read status tracking
4. ✅ Notification dispatch (cron jobs)

**Files cần tạo:**

- `src/controllers/messageController.js`
- `src/routes/messageRoutes.js`
- `src/websocket/messageSocket.js`
- `src/jobs/notificationJobs.js`

---

### Phase 7: Analytics & Reporting

**Implement:**

1. ✅ Student progress dashboard
2. ✅ Teacher analytics
3. ✅ Revenue reports
4. ✅ Course performance metrics

---

## 📁 **Folder Structure Hiện Tại**

```
src/
├── config/
│   ├── database.js          ✅ DONE
│   ├── multerConfig.js      ✅ DONE
│   ├── constants.js         (tồn tại)
├── middleware/
│   ├── authMiddleware.js    ⏳ TODO
│   ├── validation.js        ✅ DONE
│   ├── rateLimiter.js       ✅ DONE
│   ├── securityMiddleware.js ✅ DONE
│   ├── errorHandler.js      (tồn tại)
├── models/                  ✅ 13 SCHEMAS
├── services/
│   ├── apiService.js        ✅ DONE
│   └── courseService.js     ⏳ TODO
├── controllers/
│   ├── authController.js    ⏳ TODO
│   └── courseController.js  ⏳ TODO
├── routes/
│   ├── authRoutes.js        ⏳ TODO
│   ├── courseRoutes.js      ⏳ TODO
│   └── exampleRoutes.js     (ví dụ)
├── websocket/
│   └── messageSocket.js     ⏳ TODO
├── jobs/
│   └── notificationJobs.js  ⏳ TODO
└── utils/
    └── logger.js            (tồn tại)
```

---

## 🎯 **Priority Order (Gợi Ý)**

Nên làm theo thứ tự này để có working app sớm nhất:

1. **Auth Controller + Routes** → Có thể đăng ký/login
2. **Course Controller + Routes** → Có thể xem/enroll khóa
3. **Video Controller** → Có thể xem video
4. **Exercise Controller** → Có thể làm bài tập
5. **Payment Controller** → Có thể thanh toán
6. **Message Routes** → Q&A
7. **WebSocket + Notifications** → Real-time features

---

## 🧰 **Utilities Có Sẵn**

Bạn có thể dùng ngay:

### 1. Validation Middleware

```javascript
const { validateRegister, validate } = require('./middleware/validation');

router.post('/register', validateRegister, validate, handler);
```

### 2. Rate Limiting

```javascript
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');

router.post('/login', loginLimiter, handler);
```

### 3. File Upload

```javascript
const { upload } = require('./config/multerConfig');

router.post('/upload', upload.single('avatar'), handler);
```

### 4. External APIs (Axios)

```javascript
const { sendEmail, createPaymentTransaction } = require('./services/apiService');

await sendEmail(email, subject, template, variables);
```

### 5. Logging

```javascript
const logger = require('./utils/logger');

logger.info('Message');
logger.error('Error message');
logger.warn('Warning');
logger.debug('Debug info');
```

---

## 🔒 **Security Checklist**

- [x] Helmet security headers
- [x] Rate limiting
- [x] Input validation & sanitization
- [x] MongoDB injection prevention
- [ ] JWT token validation (TODO in authMiddleware)
- [ ] Role-based access control (TODO)
- [ ] CORS configuration
- [x] Secure cookie setup
- [ ] HTTPS in production (TODO)
- [ ] API key rotation (TODO)

---

## 📚 **Useful Commands**

```bash
# Start development server
npm run dev

# Format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Test database connection
node test-db.js
```

---

## 🆘 **Common Issues & Solutions**

### Issue 1: MongoDB connection timeout

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Verify MongoDB is running: `mongod` hoặc `brew services start mongodb-community`
- Check MONGODB_URI in .env

### Issue 2: JWT not defined

```
ReferenceError: JWT_SECRET is not defined
```

**Solution:**

- Add to .env: `JWT_SECRET=your_secret_key`

### Issue 3: CORS error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

- Add frontend URL to ALLOWED_ORIGINS in .env

### Issue 4: File upload not working

```
Error: ENOENT: no such file or directory, mkdir './uploads'
```

**Solution:**

```bash
mkdir -p uploads/{avatars,attachments}
```

---

## ✨ **Tiếp Theo?**

**Bạn muốn tôi tạo cái nào trước?**

1. ✅ **Authentication System** (Register/Login/JWT)
2. ✅ **Course Management** (CRUD Operations)
3. ✅ **Video & Learning Path**
4. ✅ **Exercises & Submissions**
5. ✅ **Payments & Discounts**

Bạn chọn?

---

**Status**: ✅ Database Connected & Ready
**Date**: April 8, 2026

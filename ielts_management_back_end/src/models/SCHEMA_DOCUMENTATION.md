# Database Schema Documentation

## Overview

Complete Mongoose schema implementations for IELTS Management System with 13 collections.

---

## Collections Summary

### 1. **User** - Authentication & Account Management

- **Path**: `src/models/User.js`
- **Purpose**: Manage user accounts and authentication
- **Key Fields**:
  - `email`: unique identifier
  - `password`: hashed (not returned by default)
  - `googleId`: OAuth login support
  - `role`: guest, student, teacher, staff, admin
  - `isEmailVerified`: email verification status
- **Indexes**: email, googleId, role
- **Notes**: Email verification via token required

### 2. **Student** - Student Profiles & Progress

- **Path**: `src/models/Student.js`
- **Purpose**: Student-specific data and enrollment tracking
- **Key Fields**:
  - `userId`: reference to User
  - `targetIELTSScore`: goal score (0-9)
  - `currentLevel`: A1-C2
  - `enrolledCourses`: array of enrolled courses with progress
  - `mockTestHistory`: array of test attempts with scores
  - Each skill (reading, writing, listening, speaking) tracked separately
- **Indexes**: userId, enrolledCourses.courseId
- **Notes**: Students without enrollments can still do mock tests

### 3. **Course** - Course Information

- **Path**: `src/models/Course.js`
- **Purpose**: Course details and access control
- **Key Fields**:
  - `title`, `description`: public info (visible to all)
  - `courseDetail`: detailed info (paid students only)
  - `category`: topic/skill/level
  - `level`: A1-C2
  - `teacher`: single primary teacher
  - `teachingAssistants`: multiple TAs
  - `priceTiers`: multiple pricing options
  - `publicInfo`: thumbnail, short description
- **Indexes**: teacher, teachingAssistants, category+level
- **Notes**: Access control based on payment status

### 4. **Video** - Lesson Videos

- **Path**: `src/models/Video.js`
- **Purpose**: Video lessons with strict ordering
- **Key Fields**:
  - `courseId`: parent course
  - `order`: must follow strict sequence
  - `duration`: in seconds
  - `videoUrl`: cloud storage link
  - `skills`: reading, writing, listening, speaking
  - `relatedExercises`: linked exercises
  - `isMandatory`: must complete before next video
- **Indexes**: courseId+order, order
- **Notes**: ⭐ STRICT ORDER ENFORCEMENT - student must watch in sequence

### 5. **Exercise** - Practice Questions

- **Path**: `src/models/Exercise.js`
- **Purpose**: Questions with detailed explanations
- **Key Fields**:
  - Questions array with:
    - `questionType`: multipleChoice, fillBlank, essay, speaking
    - `correctAnswer`: flexible type (string or array)
    - `explanation`: detailed answer explanation
    - `skill`: reading, writing, listening, speaking
  - No weighted scores (all questions equally weighted)
- **Indexes**: videoId, courseId
- **Notes**: Unlimited retakes allowed

### 6. **MockTest** - Full Practice Exams

- **Path**: `src/models/MockTest.js`
- **Purpose**: Complete IELTS mock tests
- **Key Fields**:
  - `sections`: array of 4 skills
  - Each skill has `parts` with questions
  - `timeLimit`: per part (optional)
  - `totalTimeLimit`: overall timeimit (optional)
  - Flexible selection: students can do full test or individual parts
- **Indexes**: title, createdAt
- **Notes**: Can be attempted unlimited times

### 7. **Submission** - Student Answers & Results

- **Path**: `src/models/Submission.js`
- **Purpose**: Track answers, scores, and test results
- **Key Fields**:
  - `submissionType`: exercise or mockTest
  - `answers`: array of answer records
  - `percentage`: (0-100)
  - `skillResults`: separate scores for 4 skills
  - `retakeCount`: tracks attempt number
- **Indexes**: studentId+courseId, studentId+submissionType+submittedAt
- **Notes**: Links to Student mock test history

### 8. **LearningPath** - Daily Lesson Schedule

- **Path**: `src/models/LearningPath.js`
- **Purpose**: Personalized daily learning schedule
- **Key Fields**:
  - `dailySchedule`: array of daily lessons
  - Each day has:
    - Specific videos to watch (in order)
    - Related exercises
    - `deadline`: must complete by date
    - `notifications`: warning/overdue/completed
  - `overallProgress`: percentage completion
- **Indexes**: None required
- **Notes**: Pre-created by AI recommendation system

### 9. **Message** - Course Chat System

- **Path**: `src/models/Message.js`
- **Purpose**: Q&A between students and instructors per course
- **Key Fields**:
  - `courseId`: isolated per course
  - `conversationId`: thread ID for organizing
  - `senderRole`: student, teacher, ta
  - `isReply`: flag for threaded replies
  - `readBy`: array tracking who read message
- **Indexes**: courseId+createdAt, senderId+courseId, conversationId
- **Notes**: Real-time via WebSocket, read status tracked

### 10. **Payment** - Transaction Records

- **Path**: `src/models/Payment.js`
- **Purpose**: Enrollment and payment tracking
- **Key Fields**:
  - `priceTier`: selected tier
  - `discountCode`: applied promotion
  - `totalAmount`: before discount
  - `finalAmount`: after discount
  - `paymentStatus`: pending/completed/failed/refunded
  - `enrollmentDate`: when access granted
- **Indexes**: studentId+courseId, paymentStatus, enrollmentDate
- **Notes**: One-time payment only, unlock on completion

### 11. **DiscountCode** - Promotional Codes

- **Path**: `src/models/DiscountCode.js`
- **Purpose**: Time-limited discount management
- **Key Fields**:
  - `code`: unique promo code
  - `discountType`: fixed or percentage
  - `validFrom/validTo`: time window
  - `maxUsageTotal`: total uses (-1 = unlimited)
  - `maxUsagePerStudent`: per-student limit
  - `usedBy`: tracking who used it
  - `applicableCourses`: null = all courses
- **Indexes**: code, validFrom+validTo
- **Notes**: Validate date range before applying

### 12. **VideoProgress** - Watch Position Tracking

- **Path**: `src/models/VideoProgress.js`
- **Purpose**: Track video viewing position and completion
- **Key Fields**:
  - `currentTime`: pause position in seconds
  - `progressPercentage`: 0-100
  - `isCompleted`: fully watched
  - `canAccessNextVideo`: order enforcement
  - `totalWatchTime`: cumulative watch time
- **Indexes**: studentId+courseId+videoId, studentId+isCompleted
- **Notes**: ⭐ Must watch >= 80% before attempting exercises

### 13. **Notification** - System Alerts

- **Path**: `src/models/Notification.js`
- **Purpose**: Alert students to deadlines and messages
- **Key Fields**:
  - `notificationType`: deadline_approaching/deadline_overdue/lesson_available/message_received/payment_required/course_started
  - `isRead`: delivery status
  - `actionUrl`: where to navigate
  - Related entity reference
- **Indexes**: studentId+isRead, studentId+courseId+createdAt
- **Notes**: Auto-created by cron jobs

### 14. **PlacementQuestion** - Ngân hàng câu hỏi thi thử đầu vào

- **Path**: `src/models/PlacementQuestion.js`
- **Purpose**: Lưu trữ ngân hàng câu hỏi dùng chung cho bài kiểm tra thi thử đầu vào
- **Key Fields**:
  - `questionText`: nội dung câu hỏi
  - `difficulty`: easy, medium, hard
  - `questionType`: multipleChoice, listeningChoice, speaking
  - Các discriminator field đặc thù (options, correctOptionIds, audioUrl, audioPromptUrl, timeLimitSeconds)
- **Indexes**: questionType
- **Notes**: Độc lập hoàn toàn với `Exercise` của khóa học

### 15. **PlacementTest** - Đợt làm bài thi thử của học viên

- **Path**: `src/models/PlacementTest.js`
- **Purpose**: Lưu phiên bản bài kiểm tra đầu vào được sinh ngẫu nhiên từ PlacementQuestion và kết quả làm bài của học viên
- **Key Fields**:
  - `studentId`: người làm bài
  - `questions`: mảng 15 câu hỏi bốc ngẫu nhiên từ PlacementQuestion
  - `answers`: mảng các câu trả lời
  - `status`: in_progress, completed, graded
  - `timeLimitMinutes`: thời gian giới hạn làm bài
  - `totalScore`: tổng điểm đánh giá
- **Indexes**: studentId+status, startedAt
- **Notes**: AI có thể cập nhật `answers.aiFeedback` và `answers.score`

---

## Key Relationships

```
User (1) ──→ (1) Student
User (1) ──→ (N) Course (as teacher)
User (1) ──→ (N) Course (as TA in array)

Course (1) ──→ (N) Video (strict order)
Video (1) ──→ (N) Exercise
Video (1) ──→ (1) VideoProgress (per student)

Course (1) ──→ (N) MockTest
MockTest (N) ──── Exercise

Course (1) ──→ (N) Payment
Payment → DiscountCode
Payment → Student

Student (1) ──→ (N) LearningPath (per course)
LearningPath.lessons → Video
LearningPath.lessons → Exercise

Student (1) ──→ (N) Submission
Student (1) ──→ (N) Message

Course (1) ──→ (N) Message (per-course chat)
```

---

## Access Control Rules

### Who can see course content?

```
❌ Guest/Unpaid Students:
   - Course: publicInfo only (description, overview, thumbnail)
   - NO access to videos, exercises, mock tests

✅ Paid Students:
   - Full course access
   - Videos must be watched in ORDER
   - Can only take exercises after watching 80% of video
   - Unlimited retakes

✅ Teacher/TAs:
   - Full course management
   - Dashboard with student progress
   - Message reply duties
```

### Payment Enforcement

```
1. Student enrolls → Payment record created (pending)
2. Payment completed → enrollmentDate set
3. Only access course if Payment.paymentStatus = "completed"
```

---

## Video Watching Logic

```
1. GET /courses/:courseId/videos/:videoId
   ├─ Check: Student paid for course
   ├─ Check: Is this first video in order?
   │  ├─ If yes: Allow access
   │  └─ If no: Check VideoProgress of previous video
   │     ├─ canAccessNextVideo = true → Allow
   │     └─ canAccessNextVideo = false → 403 Error

2. Student watches video
   ├─ Save currentTime every N seconds
   ├─ Calculate progressPercentage
   ├─ When >80% watched → Can now do exercises

3. POST /exercises/:exerciseId/submit
   ├─ Check: VideoProgress.progressPercentage >= 80
   ├─ Calculate score based on answers
   ├─ Save Submission
   ├─ Update Student.enrolledCourses[].progress
   ├─ If all daily tasks done → Remove notification
   └─ Allow unlimited retakes
```

---

## Important Validation Notes

### Indexes Are CRITICAL

- Create all indexes listed in each schema
- No compound queries without indexes = slow queries
- Especially important: courseId+order for videos

### Cascading Operations

- **Delete Course**: Should cascade to Videos, Exercises, MockTests, Submissions
- **Delete Student**: Should NOT delete (NO HARD DELETE per requirements)
- **Delete User**: If role=teacher, handle reassignment of courses

### Timestamp Management

- All schemas use `timestamps: true` → auto-updates `createdAt`, `updatedAt`
- Don't manually set these fields

### Data Validation Examples

```javascript
// Video order must be unique per course (compound index)
db.videos.createIndex({ courseId: 1, order: 1 }, { unique: true });

// Email must exist for students
Student.findOne().populate('userId'); // Must have valid userId

// Payment must be completed before access
Payment.findOne({ studentId, courseId, paymentStatus: 'completed' });
```

---

## Usage Examples

### Import All Models

```javascript
const {
  User,
  Student,
  Course,
  Video,
  Exercise,
  MockTest,
  Submission,
  LearningPath,
  Message,
  Payment,
  DiscountCode,
  VideoProgress,
  Notification,
} = require('./models');
```

### Query Examples

```javascript
// Get student profile with enrolled courses
await Student.findOne({ userId }).populate('userId').populate('enrolledCourses.courseId');

// Get course with all videos in order
await Course.findById(courseId).populate({ path: 'Videos', sort: { order: 1 } });

// Check if student can access video
const videoProgress = await VideoProgress.findOne({
  studentId,
  videoId,
  courseId,
});
if (!videoProgress?.canAccessNextVideo && videoOrder > 1) {
  throw new Error('Must complete previous video first');
}

// Get unread messages for teacher
await Message.find({
  courseId,
  $or: [{ senderRole: 'student' }, { isReply: false }],
  readBy: { $not: { $elemMatch: { userId: teacherId } } },
});
```

---

## Migration Notes for Future

- If adding new features, consider:
  - Does it need real-time updates? → Add WebSocket event
  - Does it need performance queries? → Create appropriate index
  - Does it reference another collection? → Add `.populate()`
  - Max document size: MongoDB 16MB limit (unlikely here, but aware)

---

**Last Updated**: April 8, 2026
**Status**: ✅ Ready for Implementation

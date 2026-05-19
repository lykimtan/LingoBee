const mongoose = require('mongoose');

const QUESTION_TYPES = ['multipleChoice', 'fillBlank', 'essay', 'speaking'];

//
// ======================================================
// 1. ANSWER SUB SCHEMA
// ======================================================
//
const answerSubSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },

    questionSnapshot: {
      questionText: { type: String, required: true },
      // snapshot options cho multiple choice
      options: [
        {
          id: String,
          text: String,
        },
      ],
    },

    // ==================================================
    // 🔹 DỮ LIỆU CÂU TRẢ LỜI
    // ==================================================

    selectedOptionId: {
      type: String,
      default: null,
    },

    blankAnswers: {
      type: [String],
      default: [],
    },

    essayAnswer: {
      type: String,
      default: '',
    },

    audioRecordUrl: {
      type: String,
      default: null,
    },

    audioPublicId: {
      type: String,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: null, // essay/speaking sẽ null cho tới khi chấm
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    teacherFeedback: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

//
// ======================================================
// 2. VALIDATOR CHO ANSWER
// ======================================================
//
answerSubSchema.pre('validate', function () {
  const answer = this;
  // Lấy ra document cha (ExerciseAttempt) để kiểm tra trạng thái
  const attempt = this.parent();

  // CHỈ bắt buộc có đáp án khi học viên thực sự bấm "Nộp bài" (submitted)
  // Nếu đang in_progress (lưu nháp), cho phép để trống
  if (attempt && attempt.status === 'submitted') {
    if (answer.questionType === 'multipleChoice' && !answer.selectedOptionId) {
      throw new Error('Vui lòng chọn đáp án cho câu hỏi trắc nghiệm');
    }

    if (
      answer.questionType === 'fillBlank' &&
      (!answer.blankAnswers || answer.blankAnswers.length === 0)
    ) {
      throw new Error('Vui lòng điền đáp án vào chỗ trống');
    }

    if (
      answer.questionType === 'essay' &&
      (!answer.essayAnswer || answer.essayAnswer.trim() === '')
    ) {
      throw new Error('Bài luận không được để trống');
    }

    if (answer.questionType === 'speaking' && !answer.audioRecordUrl) {
      throw new Error('Chưa có file ghi âm cho phần Speaking');
    }
  }
});

//
// ======================================================
// 3. EXERCISE ATTEMPT SCHEMA
// ======================================================
//
const exerciseAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Đảm bảo ref này khớp với model user của hệ thống
      required: true,
      index: true,
    },

    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    // support làm nhiều lần
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },

    // mảng câu trả lời
    answers: {
      type: [answerSubSchema],
      default: [],
    },

    // workflow bài làm
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'graded'],
      default: 'in_progress',
      index: true,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // ====== grading metadata ======
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    gradedAt: {
      type: Date,
      default: null,
    },

    gradeNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

//
// ======================================================
// 4. INDEXES (OPTIMIZED FOR REAL QUERIES)
// ======================================================
//

// Lịch sử học viên trong khóa học
exerciseAttemptSchema.index({ studentId: 1, courseId: 1 });

// Lấy attempt mới nhất của 1 exercise
exerciseAttemptSchema.index({ studentId: 1, exerciseId: 1, attemptNumber: -1 });

// Ensure uniqueness of attemptNumber per student+exercise to avoid duplicates
exerciseAttemptSchema.index({ studentId: 1, exerciseId: 1, attemptNumber: 1 }, { unique: true });

// Giáo viên xem bài chờ chấm
exerciseAttemptSchema.index({ status: 1, courseId: 1 });

//
// ======================================================
// 5. AUTO INCREMENT attemptNumber
// ======================================================
//
exerciseAttemptSchema.pre('save', async function () {
  // Chỉ chạy logic tăng biến đếm khi tạo bản ghi mới
  if (!this.isNew) return;

  const lastAttempt = await this.constructor
    .findOne({
      studentId: this.studentId,
      exerciseId: this.exerciseId,
    })
    .sort({ attemptNumber: -1 });

  if (lastAttempt) {
    this.attemptNumber = lastAttempt.attemptNumber + 1;
  }

  // Không dùng next() ở đây để tránh lỗi "next is not a function" trong Mongoose 7+
});

// Tự động tính totalScore trước khi lưu (tính lại để đảm bảo nhất quán)
exerciseAttemptSchema.pre('save', function () {
  // Nếu có answers, tổng hợp điểm
  if (Array.isArray(this.answers) && this.answers.length > 0) {
    const total = this.answers.reduce((acc, a) => {
      const s = Number(a.score) || 0;
      return acc + s;
    }, 0);
    this.totalScore = total;
  } else {
    this.totalScore = 0;
  }

  // Nếu status chuyển sang submitted và submittedAt chưa có, set thời điểm
  if (this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
});

//
// ======================================================
// EXPORT
// ======================================================
//
module.exports = mongoose.model('ExerciseAttempt', exerciseAttemptSchema);

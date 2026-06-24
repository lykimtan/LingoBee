const mongoose = require('mongoose');

// Schema lưu câu trả lời của học viên cho từng câu hỏi trong đề thi thử
const placementAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementQuestion',
      required: true,
    },
    // Dành cho dạng trắc nghiệm (multipleChoice, listeningChoice)
    selectedOptionIds: {
      type: [String],
      default: [],
    },
    // Dành cho dạng Speaking (học viên nộp file audio)
    audioSubmissionUrl: {
      type: String,
      default: null,
    },
    // Điểm đạt được cho câu hỏi này
    score: {
      type: Number,
      default: 0,
    },
    // Feedback và đánh giá chi tiết từ AI (đặc biệt cho phần Speaking)
    aiAssessment: {
      pronunciationScore: Number,
      accuracyScore: Number,
      fluencyScore: Number,
      completenessScore: Number,
      prosodyScore: Number,
      words: [mongoose.Schema.Types.Mixed],
    },
  },
  { _id: false }
);

// Schema chính đại diện cho 1 đợt thi thử của học viên
const placementTestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Có thể trỏ đến User nếu chưa là Student
      required: true,
    },
    // 15 câu hỏi được hệ thống bốc ngẫu nhiên khi bắt đầu bài thi
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlacementQuestion',
        required: true,
      },
    ],
    // Mảng câu trả lời của học viên
    answers: [placementAnswerSchema],
    // Giới hạn thời gian cho bài thi thử (tính bằng phút)
    timeLimitMinutes: {
      type: Number,
      default: 30, // Default 30 phút, có thể config lại
      required: true,
    },
    // Trạng thái bài thi
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'graded'],
      default: 'in_progress',
    },
    // Tổng điểm
    totalScore: {
      type: Number,
      default: 0,
    },
    // Phản hồi tổng quan
    overallFeedback: {
      type: String,
      default: '',
    },
    // Thời điểm bắt đầu
    startedAt: {
      type: Date,
      default: Date.now,
    },
    // Thời điểm nộp bài
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware cập nhật submittedAt khi chuyển status sang completed hoặc graded
placementTestSchema.pre('save', function () {
  if (
    this.isModified('status') &&
    (this.status === 'completed' || this.status === 'graded') &&
    !this.submittedAt
  ) {
    this.submittedAt = Date.now();
  }
});

// Indexes giúp query nhanh các đợt thi của học viên
placementTestSchema.index({ studentId: 1, status: 1 });
placementTestSchema.index({ startedAt: -1 });

module.exports = mongoose.model('PlacementTest', placementTestSchema);

const mongoose = require('mongoose');

const SKILLS = ['reading', 'writing', 'listening', 'speaking'];
// Đã loại bỏ 'listening' ra khỏi dạng câu hỏi
const QUESTION_TYPES = ['multipleChoice', 'fillBlank', 'essay', 'speaking'];

// 1. Base Schema cho Câu hỏi
const questionBaseSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    skill: {
      type: String,
      enum: SKILLS,
      default: 'reading',
    },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    // --- CÁC TRƯỜNG MỚI ĐƯỢC CHUYỂN LÊN BASE SCHEMA ---
    audioUrl: {
      type: String,
      validate: [
        function (value) {
          // Bắt buộc phải có audio nếu kỹ năng là listening
          if (this.skill === 'listening' && (!value || value.trim() === '')) {
            return false;
          }
          return true;
        },
        'Câu hỏi kỹ năng Listening bắt buộc phải có link file audio',
      ],
    },
    transcript: {
      type: String,
      default: '', // Lời thoại của audio, dùng để hiển thị khi học viên xem giải thích
    },
  },
  { discriminatorKey: 'questionType', _id: true } // Mongoose sẽ dùng trường questionType để phân biệt
);

// 2. Schema chính cho Exercise
const exerciseSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Nhúng Base Schema vào dạng mảng
    questions: {
      type: [questionBaseSchema],
      validate: [
        function (value) {
          if (this.videoId) return true;
          return Array.isArray(value) && value.length > 0;
        },
        'Exercise without video must have at least one question',
      ],
    },
  },
  { timestamps: true }
);

// Indexes
exerciseSchema.index({ videoId: 1 });
exerciseSchema.index({ courseId: 1 });

// 3. Định nghĩa các dạng câu hỏi cụ thể (Discriminators)
const questionArray = exerciseSchema.path('questions');

// Dạng 1: Trắc nghiệm (Multiple Choice)
questionArray.discriminator(
  'multipleChoice',
  new mongoose.Schema({
    options: {
      type: [
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
        },
      ],
      required: true,
      validate: [(v) => v.length >= 2, 'Cần ít nhất 2 lựa chọn'],
    },
    correctOptionId: {
      type: String,
      required: true,
      validate: [
        function (value) {
          if (!Array.isArray(this.options)) return false;
          return this.options.some((opt) => opt.id === value);
        },
        'ID đáp án đúng phải nằm trong danh sách các lựa chọn',
      ],
    },
  })
);

// Dạng 2: Điền vào chỗ trống (Fill in the Blank)
questionArray.discriminator(
  'fillBlank',
  new mongoose.Schema({
    correctAnswers: {
      type: [String],
      required: true,
      validate: [
        (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => typeof item === 'string' && item.trim().length > 0),
        'Cần ít nhất 1 đáp án và không được để trống',
      ],
    },
    // Chuyển isExactMatch vào đây vì dạng điền từ luôn cần xét xem có phân biệt hoa/thường hay không
    isExactMatch: {
      type: Boolean,
      default: false,
    },
  })
);

// Dạng 3: Tự luận (Essay)
questionArray.discriminator(
  'essay',
  new mongoose.Schema({
    minWords: {
      type: Number,
      default: 100,
    },
  })
);

// Dạng 4: Speaking
questionArray.discriminator(
  'speaking',
  new mongoose.Schema({
    audioPromptUrl: {
      type: String, // Link file audio mẫu để học viên nghe theo
    },
    timeLimitSeconds: {
      type: Number,
      default: 60,
    },
  })
);

// Middleware kiểm tra (Đã tối ưu cho Mongoose hiện đại)
exerciseSchema.pre('save', async function () {
  // Bỏ try-catch vì Mongoose sẽ tự động bắt lỗi từ Promise rejection
  if (!this.videoId) return;

  const Video = mongoose.model('Video');
  const video = await Video.findById(this.videoId);

  if (!video || video.courseId.toString() !== this.courseId.toString()) {
    // Thay vì return next(new Error(...)), ta throw trực tiếp
    throw new Error('Video does not belong to this course');
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);

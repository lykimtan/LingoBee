const mongoose = require('mongoose');

const SKILLS = ['reading', 'writing', 'listening', 'speaking'];
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
      type: [String],
      required: true,
      validate: [(v) => v.length >= 2, 'Cần ít nhất 2 lựa chọn'],
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: [
        function (value) {
          if (!Array.isArray(this.options)) return false;
          return this.options.includes(value);
        },
        'Đáp án đúng phải nằm trong danh sách lựa chọn',
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

// Middleware kiểm tra
exerciseSchema.pre('save', async function (next) {
  try {
    if (!this.videoId) return next();

    const Video = mongoose.model('Video');
    const video = await Video.findById(this.videoId);

    if (!video || video.courseId.toString() !== this.courseId.toString()) {
      return next(new Error('Video does not belong to this course'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);

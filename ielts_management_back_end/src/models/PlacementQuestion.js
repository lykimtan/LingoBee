const mongoose = require('mongoose');

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];
const QUESTION_TYPES = ['multipleChoice', 'listeningChoice', 'speaking'];

// Base Schema cho Câu hỏi Placement Test (Ngân hàng câu hỏi)
const placementQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
      default: 'medium',
    },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Để vô hiệu hóa các câu hỏi không còn dùng thay vì xóa
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { discriminatorKey: 'questionType', timestamps: true }
);

// Mongoose model cơ bản
const PlacementQuestion = mongoose.model('PlacementQuestion', placementQuestionSchema);

// Dạng 1: Trắc nghiệm (Multiple Choice)
PlacementQuestion.discriminator(
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
    // Mảng chứa ID của các đáp án đúng (Hỗ trợ câu hỏi có nhiều đáp án)
    correctOptionIds: {
      type: [String],
      required: true,
      validate: [
        function (value) {
          if (!Array.isArray(this.options)) return false;
          // Kiểm tra tất cả đáp án đúng đều phải nằm trong danh sách options
          const optionIds = this.options.map((opt) => opt.id);
          return value.length > 0 && value.every((id) => optionIds.includes(id));
        },
        'Cần ít nhất 1 đáp án và các đáp án phải tồn tại trong danh sách lựa chọn',
      ],
    },
  })
);

// Dạng 2: Listening + Multiple Choice
PlacementQuestion.discriminator(
  'listeningChoice',
  new mongoose.Schema({
    audioUrl: {
      type: String,
      required: true, // 1 audio cho 1 câu hỏi
    },
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
    correctOptionIds: {
      type: [String],
      required: true,
      validate: [
        function (value) {
          if (!Array.isArray(this.options)) return false;
          const optionIds = this.options.map((opt) => opt.id);
          return value.length > 0 && value.every((id) => optionIds.includes(id));
        },
        'Cần ít nhất 1 đáp án và các đáp án phải tồn tại trong danh sách lựa chọn',
      ],
    },
  })
);

// Dạng 3: Speaking
PlacementQuestion.discriminator(
  'speaking',
  new mongoose.Schema({
    audioPromptUrl: {
      type: String, // Audio đề bài (tùy chọn)
    },
    timeLimitSeconds: {
      type: Number,
      default: 45, // Thời lượng tối đa để trả lời là 45s như yêu cầu
      max: 45,
    },
  })
);

module.exports = PlacementQuestion;

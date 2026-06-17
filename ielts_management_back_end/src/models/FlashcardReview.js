const mongoose = require('mongoose');

const flashcardReviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flashcardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: true, // Lưu để dễ query list review theo deck
    },
    status: {
      type: String,
      enum: ['new', 'learning', 'reviewing', 'graduated'],
      default: 'new',
    },
    interval: {
      type: Number,
      default: 0, // Khoảng cách review tiếp theo (tính bằng ngày)
    },
    repetition: {
      type: Number,
      default: 0, // Số chuỗi trả lời đúng
    },
    easeFactor: {
      type: Number,
      default: 2.5, // Hệ số độ khó (E-Factor theo thuật toán SM-2)
    },
    nextReviewDate: {
      type: Date,
      default: null, // Ngày review tiếp theo. null nếu status là 'new'
    },
    lastReviewedAt: {
      type: Date,
      default: null, // Thời điểm ôn tập cuối cùng (Quan trọng để tính chuỗi Streak Gamification)
    },
  },
  { timestamps: true }
);

// Indexes cho SRS queries
flashcardReviewSchema.index({ studentId: 1, deckId: 1 });
flashcardReviewSchema.index({ studentId: 1, nextReviewDate: 1 }); // Để query "Due cards" nhanh
flashcardReviewSchema.index({ studentId: 1, flashcardId: 1 }, { unique: true }); // Mỗi sinh viên chỉ có 1 review state cho 1 card

module.exports = mongoose.model('FlashcardReview', flashcardReviewSchema);

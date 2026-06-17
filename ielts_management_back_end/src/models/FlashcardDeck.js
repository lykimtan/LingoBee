const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Có thể là Giáo viên hoặc Học viên
    },
    isPublic: {
      type: Boolean,
      default: false, // true = có thể chia sẻ cho học viên khác
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
  },
  { timestamps: true }
);

// Indexes
flashcardDeckSchema.index({ courseId: 1 });
flashcardDeckSchema.index({ creatorId: 1 });
flashcardDeckSchema.index({ isPublic: 1 });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);

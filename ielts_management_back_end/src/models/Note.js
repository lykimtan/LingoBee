const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    timestamp: {
      type: Number,
      required: true,
      min: 0,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ videoId: 1, userId: 1, timestamp: 1 });

noteSchema.index({ courseId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);

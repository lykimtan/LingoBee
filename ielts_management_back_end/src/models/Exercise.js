const mongoose = require('mongoose');

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
    questions: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        questionText: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          enum: ['multipleChoice', 'fillBlank', 'essay', 'speaking'],
          required: true,
        },
        options: [String], // For multipleChoice
        correctAnswer: mongoose.Schema.Types.Mixed, // String or [String]
        explanation: {
          type: String,
          required: true, // Detailed explanation for each question
        },
        skill: {
          type: String,
          enum: ['reading', 'writing', 'listening', 'speaking'],
          default: 'reading',
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
exerciseSchema.index({ videoId: 1 });
exerciseSchema.index({ courseId: 1 });

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

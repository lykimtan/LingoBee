const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    submissionType: {
      type: String,
      enum: ['exercise', 'mockTest'],
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      default: null,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    mockTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      default: null,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        studentAnswer: mongoose.Schema.Types.Mixed, // String or [String]
        isCorrect: {
          type: Boolean,
          default: false,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    skillResults: {
      reading: {
        score: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
      writing: {
        score: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
      listening: {
        score: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
      speaking: {
        score: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeTaken: {
      type: Number,
      default: 0, // in seconds
    },
    retakeCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
submissionSchema.index({ studentId: 1, courseId: 1 });
submissionSchema.index({ studentId: 1, submissionType: 1, submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);

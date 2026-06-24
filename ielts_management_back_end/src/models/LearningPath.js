const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    preferences: {
      targetDate: { type: Date }, // AI target finish date
      availableDays: [{ type: Number }], // e.g., 2,4,6 for Mon, Wed, Fri
      hoursPerDay: { type: Number, default: 2 },
    },
    dailySchedule: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },
        date: {
          type: Date,
          required: true,
        },
        deadline: {
          type: Date,
          required: true,
        },
        lessons: [
          {
            videoId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Video',
              required: true,
            },
            order: {
              type: Number,
              required: true, // Must follow this order
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
            completedAt: {
              type: Date,
              default: null,
            },
            exercises: [
              {
                exerciseId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Exercise',
                  required: true,
                },
                isCompleted: {
                  type: Boolean,
                  default: false,
                },
                score: {
                  type: Number,
                  default: 0,
                },
              },
            ],
          },
        ],
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add unique compound index for studentId and courseId
learningPathSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('LearningPath', learningPathSchema);

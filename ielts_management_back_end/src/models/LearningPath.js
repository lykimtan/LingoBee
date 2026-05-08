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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
              },
            ],
          },
        ],
        notifications: [
          {
            type: {
              type: String,
              enum: ['warning', 'overdue', 'completed'],
              required: true,
            },
            message: {
              type: String,
              required: true,
            },
            isRead: {
              type: Boolean,
              default: false,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
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

module.exports = mongoose.model('LearningPath', learningPathSchema);

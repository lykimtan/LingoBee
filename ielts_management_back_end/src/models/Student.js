const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetIELTSScore: {
      type: Number,
      min: 0,
      max: 9,
      default: null,
    },
    estimatedTestDate: {
      type: Date,
      default: null,
    },
    currentLevel: {
      type: String,
      default: null,
    },
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        enrollmentDate: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        status: {
          type: String,
          enum: ['active', 'completed', 'dropped'],
          default: 'active',
        },
        learningPath: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LearningPath',
          default: null,
        },
      },
    ],
    mockTestHistory: [
      {
        mockTestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MockTest',
          required: true,
        },
        attemptDate: {
          type: Date,
          default: Date.now,
        },
        totalScore: {
          type: Number,
          default: 0,
        },
        skills: {
          reading: {
            type: Number,
            default: 0,
          },
          writing: {
            type: Number,
            default: 0,
          },
          listening: {
            type: Number,
            default: 0,
          },
          speaking: {
            type: Number,
            default: 0,
          },
        },
        submissionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Submission',
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for enrolled courses (userId already has unique index)
studentSchema.index({ 'enrolledCourses.courseId': 1 });

module.exports = mongoose.model('Student', studentSchema);

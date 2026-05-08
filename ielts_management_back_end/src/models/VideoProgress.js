const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
    currentTime: {
      type: Number,
      default: 0, // in seconds - position when stopped
    },
    duration: {
      type: Number,
      required: true, // total duration in seconds
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Force video to be watched in order
    canAccessNextVideo: {
      type: Boolean,
      default: false, // Only true when this video is completed
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    totalWatchTime: {
      type: Number,
      default: 0, // total time spent watching in seconds
    },
  },
  { timestamps: true }
);

// Indexes
videoProgressSchema.index({ studentId: 1, courseId: 1, videoId: 1 });
videoProgressSchema.index({ studentId: 1, isCompleted: 1 });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);

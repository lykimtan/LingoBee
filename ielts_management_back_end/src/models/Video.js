const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
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
    duration: {
      type: Number,
      required: true, // in seconds
      min: 0,
    },
    videoUrl: {
      type: String,
      required: true, // Cloud URL
    },
    order: {
      type: Number,
      required: true, // Must follow strict order
      min: 1,
    },
    skills: [
      {
        type: String,
        enum: ['reading', 'writing', 'listening', 'speaking'],
      },
    ],
    relatedExercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
videoSchema.index({ courseId: 1, order: 1 });
videoSchema.index({ order: 1 });

module.exports = mongoose.model('Video', videoSchema);

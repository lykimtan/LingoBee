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
    thumbnailUrl: {
      type: String,
      default: '',
    },
    materialUrl: {
      type: String,
      default: '', // Cloud URL for PDF
    },
    materialName: {
      type: String,
      default: '', // Original file name
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
    isPublished: {
      type: Boolean,
      default: false,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
videoSchema.index({ courseId: 1, order: 1 }, { unique: true });

videoSchema.virtual('exercises', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
});

module.exports = mongoose.model('Video', videoSchema);

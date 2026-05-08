const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    sections: [
      {
        skill: {
          type: String,
          enum: ['reading', 'writing', 'listening', 'speaking'],
          required: true,
        },
        parts: [
          {
            partNumber: {
              type: Number,
              required: true,
              min: 1,
            },
            questions: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
              },
            ],
            timeLimit: {
              type: Number,
              default: null, // in minutes, null = no limit
            },
          },
        ],
      },
    ],
    totalTimeLimit: {
      type: Number,
      default: null, // in minutes, null = no limit
    },
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 60,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
mockTestSchema.index({ title: 1 });
mockTestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MockTest', mockTestSchema);

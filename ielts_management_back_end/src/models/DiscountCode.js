const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null means no limit. Useful for percentage discounts.
    },
    maxUsageTotal: {
      type: Number,
      required: true,
      default: -1, // -1 = unlimited
    },
    maxUsagePerStudent: {
      type: Number,
      required: true,
      default: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        usageCount: {
          type: Number,
          default: 1,
        },
      },
    ],
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true, // Time-limited
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ], // null or empty = apply to all courses
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// No additional indexes needed (code field already has unique index)
discountCodeSchema.index({ validFrom: 1, validTo: 1 });

module.exports = mongoose.model('DiscountCode', discountCodeSchema);

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    priceTier: {
      name: {
        type: String,
        required: true,
      },
      basePrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    discountCode: {
      code: {
        type: String,
        default: null,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0, // If percentage discount
      },
      appliedDate: {
        type: Date,
        default: null,
      },
      codeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscountCode',
        default: null,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: null, // From payment gateway
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'momo', 'bank_transfer'],
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: null, // When student officially enrolled
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ studentId: 1, courseId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ enrollmentDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

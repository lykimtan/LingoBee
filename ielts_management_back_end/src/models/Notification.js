const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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
    notificationType: {
      type: String,
      enum: [
        'deadline_approaching',
        'deadline_overdue',
        'lesson_available',
        'message_received',
        'payment_required',
        'course_started',
      ],
      required: true,
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['lesson', 'exercise', 'mocktest', 'message', 'course'],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    title: {
      type: String,
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
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null, // URL to navigate to the resource
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ studentId: 1, isRead: 1 });
notificationSchema.index({ studentId: 1, courseId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

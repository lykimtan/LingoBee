const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
        'course_invitation',
        'video_feedback',
        'course_preview_request',
        'exercise_submitted',
        'exercise_graded',
        'comment_reply',
      ],
      required: true,
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['lesson', 'exercise', 'mocktest', 'message', 'course', 'course_invitation', 'feedback', 'video'],
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
notificationSchema.index({ recipientUser: 1, isRead: 1 });
notificationSchema.index({ studentId: 1, courseId: 1, createdAt: -1 });

notificationSchema.pre('validate', function () {
  if (!this.studentId && !this.recipientUser) {
    this.invalidate('recipientUser', 'Recipient is required');
  }
});

module.exports = mongoose.model('Notification', notificationSchema);

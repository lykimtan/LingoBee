const mongoose = require('mongoose');

const courseInvitationSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    role: {
      type: String,
      enum: ['primary', 'assistant'],
      default: 'primary',
    },
    message: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

courseInvitationSchema.index({ course: 1, teacher: 1 }, { unique: true });
courseInvitationSchema.index({ teacher: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CourseInvitation', courseInvitationSchema);

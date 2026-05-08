const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true, // Each course has its own chat
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(), // Thread ID for organizing conversations
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'teacher', 'ta'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: String,
        fileName: String,
        fileType: String,
      },
    ],
    isReply: {
      type: Boolean,
      default: false,
    },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Read status tracking for messages
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ courseId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, courseId: 1 });
messageSchema.index({ conversationId: 1 });

module.exports = mongoose.model('Message', messageSchema);

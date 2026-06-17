const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
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
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

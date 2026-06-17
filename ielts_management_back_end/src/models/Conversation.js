const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['group', 'private'], // 'group' cho phòng chung, 'private' cho phòng riêng
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        lastReadMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message',
          default: null, // Mô hình Watermark: Đánh dấu tin nhắn cuối cùng user này đã đọc
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null, // Lưu tin nhắn cuối cùng để hiển thị preview
    },
  },
  { timestamps: true }
);

// Indexes để query nhanh
conversationSchema.index({ courseId: 1, type: 1 });
conversationSchema.index({ 'participants.userId': 1 }); // Index truy vấn phòng chat theo user nhanh chóng

module.exports = mongoose.model('Conversation', conversationSchema);

const mongoose = require('mongoose');
const { Conversation, Message, User, Course } = require('../models');
const { getRedis, getValue, setWithTTL } = require('../config/redis');
const { getIo } = require('../socket');
const logger = require('../utils/logger');

const getCourseConversations = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { courseId: new mongoose.Types.ObjectId(courseId) };

    if (userRole === 'student') {
      // Học viên chỉ thấy phòng group và phòng private của chính họ
      query.$or = [
        { type: 'group' },
        { type: 'private', 'participants.userId': new mongoose.Types.ObjectId(userId) }
      ];
    } else {
      // Giảng viên/Trợ giảng thấy phòng group và tất cả phòng private của khóa học
    }

    let conversations = await Conversation.find(query)
      .populate('lastMessage')
      .populate('participants.userId', 'name avatar role email')
      .sort({ updatedAt: -1 })
      .lean();

    // Lazy initialization: Auto-create group conversation if it doesn't exist
    const hasGroup = conversations.some(c => c.type === 'group');
    if (!hasGroup) {
      const newGroup = new Conversation({
        type: 'group',
        courseId,
        participants: []
      });
      await newGroup.save();
      conversations.unshift(newGroup.toObject());
    }

    // Lazy initialization: Auto-create private conversation between Student and Course Teacher if it doesn't exist
    if (userRole === 'student') {
      const hasPrivate = conversations.some(c => c.type === 'private');
      if (!hasPrivate) {
        const course = await Course.findById(courseId);
        if (course && course.teacher) {
          const newPrivate = new Conversation({
            type: 'private',
            courseId,
            participants: [
              { userId },
              { userId: course.teacher }
            ]
          });
          await newPrivate.save();
          await newPrivate.populate('participants.userId', 'name avatar role email');
          conversations.push(newPrivate.toObject());
        }
      }
    }

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error(`getCourseConversations error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách phòng chat' });
  }
};

const createPrivateConversation = async (req, res) => {
  try {
    const { courseId, targetUserId } = req.body;
    const userId = req.user.id;

    // Kiểm tra xem phòng đã tồn tại chưa
    let conversation = await Conversation.findOne({
      courseId,
      type: 'private',
      'participants.userId': { $all: [userId, targetUserId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        courseId,
        type: 'private',
        participants: [
          { userId },
          { userId: targetUserId }
        ]
      });
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    logger.error(`createPrivateConversation error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo phòng chat' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let { limit = 50, skip = 0 } = req.query;
    limit = parseInt(limit);
    skip = parseInt(skip);

    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const cacheKey = `${redisPrefix}chat:${conversationId}:messages`;

    // Nếu lấy page đầu tiên, check Redis Cache
    if (skip === 0) {
      const cachedMessages = await getValue(cacheKey);
      if (cachedMessages && cachedMessages.length > 0) {
        return res.status(200).json({
          success: true,
          data: cachedMessages,
          source: 'redis'
        });
      }
    }

    // Nếu không có cache hoặc lấy page cũ, query DB
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name avatar role')
      .populate({
        path: 'replyToMessageId',
        select: 'message senderId',
        populate: { path: 'senderId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Cập nhật Cache nếu là page đầu
    if (skip === 0 && messages.length > 0) {
      await setWithTTL(cacheKey, messages, 3600); // Lưu cache 1 giờ
    }

    res.status(200).json({
      success: true,
      data: messages,
      source: 'mongodb'
    });
  } catch (error) {
    logger.error(`getMessages error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy tin nhắn' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, attachments, replyToMessageId } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    const newMessage = new Message({
      conversationId,
      senderId,
      senderRole,
      message,
      attachments: attachments || [],
      replyToMessageId: replyToMessageId || null,
    });

    await newMessage.save();

    // Populate dữ liệu người gửi để trả về và bắn socket
    await newMessage.populate('senderId', 'name avatar role');
    if (replyToMessageId) {
       await newMessage.populate({
         path: 'replyToMessageId',
         select: 'message senderId',
         populate: { path: 'senderId', select: 'name' }
       });
    }

    // Cập nhật lastMessage của Conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    // Invalid Redis Cache tin nhắn
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const cacheKey = `${redisPrefix}chat:${conversationId}:messages`;
    const redisClient = getRedis();
    if (redisClient) {
       await redisClient.del(cacheKey); // Xóa cache để lần sau getMessages query lại và set cache mới
    }

    // Bắn Socket.IO Event
    try {
      const io = getIo();
      io.to(`conversation:${conversationId}`).emit('chat:newMessage', newMessage);
    } catch (e) {
      logger.error(`Socket error when sending message: ${e.message}`);
    }

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    logger.error(`sendMessage error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi gửi tin nhắn' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, 'participants.userId': userId },
      { $set: { 'participants.$.lastReadMessageId': messageId } },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng chat hoặc bạn không có quyền' });
    }

    // Bắn Socket Event (Watermark update)
    try {
      const io = getIo();
      io.to(`conversation:${conversationId}`).emit('chat:readReceipt', {
        conversationId,
        userId,
        lastReadMessageId: messageId
      });
    } catch (e) {}

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc'
    });
  } catch (error) {
    logger.error(`markAsRead error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái đọc' });
  }
};

module.exports = {
  getCourseConversations,
  createPrivateConversation,
  getMessages,
  sendMessage,
  markAsRead
};

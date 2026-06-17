const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { User } = require('../models');
const logger = require('../utils/logger');
const { setWithTTL, deleteKey } = require('../config/redis');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn(`Socket auth missing token: ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        logger.warn(`Socket auth user not found: ${socket.id}`);
        socket.disconnect(true);
        return;
      }

      socket.data.userId = user.id;
      socket.join(`user:${user.id}`);

      // Set user online status in Redis
      const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
      await setWithTTL(`${redisPrefix}user:online:${user.id}`, true, 86400);

      // Chat Realtime: Join conversation room
      socket.on('chat:joinRoom', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${user.id} joined conversation ${conversationId}`);
      });

      socket.on('chat:leaveRoom', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
      });

    } catch (error) {
      logger.warn(`Socket auth failed: ${error.message}`);
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      if (socket.data.userId) {
        const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
        await deleteKey(`${redisPrefix}user:online:${socket.data.userId}`);
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitNotification = (notification) => {
  const socketServer = getIo();
  const payload = {
    id: notification._id,
    recipientUser: notification.recipientUser || null,
    courseId: notification.courseId,
    notificationType: notification.notificationType,
    title: notification.title,
    message: notification.message,
    actionUrl: notification.actionUrl,
    createdAt: notification.createdAt,
  };

  if (notification.recipientUser) {
    socketServer.to(`user:${notification.recipientUser}`).emit('notification:new', payload);
    return;
  }

  socketServer.emit('notification:new', payload);
};

module.exports = {
  initSocket,
  getIo,
  emitNotification,
};

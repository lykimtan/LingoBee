const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { User } = require('../models');
const logger = require('../utils/logger');

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
    } catch (error) {
      logger.warn(`Socket auth failed: ${error.message}`);
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
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

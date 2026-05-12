const { Notification } = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { isRead, limit = 50, page = 1 } = req.query;
    const query = { recipientUser: req.user.id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const skip = (pageNumber - 1) * limitNumber;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Notification.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      data: notifications,
    });
  } catch (error) {
    logger.error(`Error in getMyNotifications: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   POST /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientUser: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    logger.error(`Error in markAllNotificationsRead: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   POST /api/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientUser: req.user.id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    logger.error(`Error in markNotificationRead: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
};

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authMiddleware, getMyNotifications);
router.post('/read-all', authMiddleware, markAllNotificationsRead);
router.post('/:id/read', authMiddleware, markNotificationRead);

module.exports = router;

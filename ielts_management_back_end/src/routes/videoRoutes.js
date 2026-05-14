const express = require('express');
const { authMiddleware, isTeacher } = require('../middleware/authMiddleware');
const {
  getCourseVideos,
  createCourseVideo,
  updateVideo,
  deleteVideo,
} = require('../controllers/videoController');

const router = express.Router();

// /api/videos/course/:courseId
router.get('/course/:courseId', authMiddleware, isTeacher, getCourseVideos);
router.post('/course/:courseId', authMiddleware, isTeacher, createCourseVideo);

// /api/videos/:videoId
router.put('/:videoId', authMiddleware, isTeacher, updateVideo);
router.delete('/:videoId', authMiddleware, isTeacher, deleteVideo);

module.exports = router;

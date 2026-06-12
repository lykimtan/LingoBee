const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
  toggleLike,
  getCommentsByCourseVideos,
  getMyReviewStatus,
  submitCourseAndTeacherReview
} = require('../controllers/commentController');

const router = express.Router();

// Lấy danh sách bình luận cho toàn bộ video trong khóa học (dành cho teacher)
router.get('/teacher/course/:courseId', authMiddleware, getCommentsByCourseVideos);

// Kiểm tra trạng thái review khóa học của user hiện tại
router.get('/course/:courseId/my-review', authMiddleware, getMyReviewStatus);

// Gửi đánh giá gộp (Course + Teacher)
router.post('/course/:courseId/reviews', authMiddleware, submitCourseAndTeacherReview);

// Lấy danh sách bình luận (có thể mở public nếu muốn, nhưng hiện tại require login)
router.get('/target/:targetType/:targetId', authMiddleware, getComments);

// Lấy danh sách bình luận (public)
router.get('/public/target/:targetType/:targetId', getComments);

// Lấy danh sách các phản hồi (replies) của một bình luận
router.get('/:commentId/replies', authMiddleware, getReplies);

// Tạo bình luận mới
router.post('/', authMiddleware, createComment);

// Cập nhật bình luận
router.put('/:id', authMiddleware, updateComment);

// Xoá bình luận (soft delete)
router.delete('/:id', authMiddleware, deleteComment);

// Thả tim / Bỏ thả tim bình luận
router.post('/:id/like', authMiddleware, toggleLike);

module.exports = router;

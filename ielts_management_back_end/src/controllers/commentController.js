const Comment = require('../models/Comment');
const Video = require('../models/Video');
const { Course, Notification, User } = require('../models');
const { emitNotification } = require('../socket');

// Create a new comment or review
exports.createComment = async (req, res, next) => {
  try {
    const { targetType, targetId, content, rating, parentId } = req.body;
    const author = req.user._id;

    if (!targetType || !targetId || !content) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ targetType, targetId và content' });
    }

    const commentData = {
      author,
      targetType,
      targetId,
      content
    };

    if (rating != null) commentData.rating = rating;
    if (parentId != null) commentData.parentId = parentId;

    const comment = await Comment.create(commentData);
    
    // Populate author info before returning
    await comment.populate('author', 'name avatar email');

    // Notify parent comment author if it's a reply
    if (parentId) {
      const parentComment = await Comment.findById(parentId).populate('author');
      if (parentComment && parentComment.author._id.toString() !== author.toString()) {
        let courseId = null;
        let actionUrl = '';

        if (targetType === 'Video') {
          const video = await Video.findById(targetId);
          if (video) {
            courseId = video.courseId;
            const course = await Course.findById(courseId);
            if (course) {
              actionUrl = `/course/${course.slug}/learn/${targetId}`;
            }
          }
        } else if (targetType === 'Course') {
          courseId = targetId;
          const course = await Course.findById(courseId);
          if (course) {
            actionUrl = `/course/${course.slug}/learn`;
          }
        }

        if (courseId) {
          const parentAuthorUser = await User.findById(parentComment.author._id);
          const notification = await Notification.create({
            recipientUser: parentComment.author._id,
            studentId: parentAuthorUser?.role === 'student' ? parentComment.author._id : null,
            courseId: courseId,
            notificationType: 'comment_reply',
            relatedEntity: {
              type: targetType === 'Video' ? 'video' : 'course',
              id: targetId
            },
            title: 'Có phản hồi mới cho bình luận của bạn',
            message: `${comment.author.name} đã trả lời bình luận của bạn.`,
            actionUrl: actionUrl || null
          });
          
          emitNotification(notification);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Get comments for a specific target (Video, Course, or Teacher)
exports.getComments = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { 
      targetType, 
      targetId, 
      parentId: null, // Only fetch root comments here
      status: 'active' 
    };

    const comments = await Comment.find(query)
      .populate('author', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    for (let comment of comments) {
      comment.replyCount = await Comment.countDocuments({ parentId: comment._id, status: 'active' });
    }

    const total = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get replies for a specific comment
exports.getReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    const replies = await Comment.find({ parentId: commentId, status: 'active' })
      .populate('author', 'name avatar email')
      .sort({ createdAt: 1 }); // Oldest first for a logical chat thread flow

    res.status(200).json({
      success: true,
      data: replies
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findOne({ _id: id, author: userId });
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận hoặc bạn không có quyền sửa' });
    }

    if (content) comment.content = content;
    if (rating !== undefined) comment.rating = rating;

    // Use .save() instead of findOneAndUpdate to trigger Mongoose validators (like the rating check)
    await comment.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment (Soft delete)
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    if (comment.author.toString() !== userId.toString() && userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá bình luận này' });
    }

    comment.status = 'deleted';
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Bình luận đã được xoá thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Like on a comment
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    const isLiked = comment.likes.includes(userId);

    let updatedComment;
    if (isLiked) {
      // Unlike
      updatedComment = await Comment.findByIdAndUpdate(
        id,
        { $pull: { likes: userId }, $inc: { likeCount: -1 } },
        { returnDocument: 'after' }
      );
    } else {
      // Like
      updatedComment = await Comment.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId }, $inc: { likeCount: 1 } },
        { returnDocument: 'after' }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: updatedComment.likeCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all root comments for all videos of a specific course (For Teacher Dashboard)
exports.getCommentsByCourseVideos = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 1. Get all videos for the course
    const videos = await Video.find({ courseId }).select('_id title thumbnailUrl order videoUrl description');
    const videoIds = videos.map(v => v._id);

    // 2. Find root comments for these videos
    const query = {
      targetType: 'Video',
      targetId: { $in: videoIds },
      parentId: null,
      status: 'active'
    };

    const comments = await Comment.find(query)
      .populate('author', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    for (let comment of comments) {
      comment.replyCount = await Comment.countDocuments({ parentId: comment._id, status: 'active' });
    }

    const total = await Comment.countDocuments(query);

    // Create a mapping of video details for the frontend
    const videoMap = {};
    videos.forEach(v => {
      videoMap[v._id] = v;
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        videos: videoMap,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check if current student has submitted a review for a course
exports.getMyReviewStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const author = req.user._id;

    const review = await Comment.findOne({
      targetType: 'Course',
      targetId: courseId,
      author,
      rating: { $exists: true, $ne: null }
    });

    res.status(200).json({
      success: true,
      data: {
        hasReviewed: !!review,
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

// Submit combined course and teacher review
exports.submitCourseAndTeacherReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { courseRating, teacherRating, comment } = req.body;
    const author = req.user._id;

    // 1. Verify required fields
    if (!courseRating || !teacherRating || !comment) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ đánh giá khóa học, giáo viên và nhận xét.' });
    }

    // 2. Fetch Course to get Teacher ID
    const { Course, User, Student } = require('../models');
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học.' });
    }

    // 3. (Removed progress check as requested)

    // 4. Verify they haven't reviewed yet
    const existingReview = await Comment.findOne({
      targetType: 'Course',
      targetId: courseId,
      author,
      rating: { $exists: true, $ne: null }
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá khóa học này rồi.' });
    }

    // 5. Create Comments
    const courseComment = await Comment.create({
      author,
      targetType: 'Course',
      targetId: courseId,
      rating: courseRating,
      content: comment
    });

    const teacherComment = await Comment.create({
      author,
      targetType: 'User',
      targetId: course.teacher,
      rating: teacherRating,
      content: comment
    });

    // 6. Recalculate average ratings
    // Course
    const courseAgg = await Comment.aggregate([
      { $match: { targetType: 'Course', targetId: course._id, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
    ]);
    if (courseAgg.length > 0) {
      course.averageRating = Math.round(courseAgg[0].avgRating * 10) / 10;
      course.totalReviews = courseAgg[0].total;
      await course.save();
    }

    // Teacher
    const teacherAgg = await Comment.aggregate([
      { $match: { targetType: 'User', targetId: course.teacher, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
    ]);
    if (teacherAgg.length > 0) {
      const teacher = await User.findById(course.teacher);
      if (teacher) {
        teacher.averageRating = Math.round(teacherAgg[0].avgRating * 10) / 10;
        teacher.totalReviews = teacherAgg[0].total;
        await teacher.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá!',
      data: { courseComment, teacherComment }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Hide/Unhide comment for Admin/Teacher
exports.toggleHideComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== 'admin' && userRole !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền ẩn/hiện bình luận này' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
    }

    comment.status = comment.status === 'hidden' ? 'active' : 'hidden';
    await comment.save();

    res.status(200).json({
      success: true,
      data: comment,
      message: comment.status === 'hidden' ? 'Đã ẩn bình luận thành công' : 'Đã hiện lại bình luận thành công'
    });
  } catch (error) {
    next(error);
  }
};

const Comment = require('../models/Comment');

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
      .limit(parseInt(limit));

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

    const comment = await Comment.findOneAndUpdate(
      { _id: id, author: userId },
      { status: 'deleted' },
      { returnDocument: 'after' }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận hoặc bạn không có quyền xoá' });
    }

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

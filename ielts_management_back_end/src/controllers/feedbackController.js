const { Feedback, Notification, Course } = require('../models');
const { emitNotification } = require('../socket');
const logger = require('../utils/logger');

/**
 * @desc    Create feedback for a video
 * @route   POST /api/feedbacks
 * @access  Private/Admin
 */
const createFeedback = async (req, res, next) => {
  try {
    const { videoId, courseId, message } = req.body;

    if (!videoId || !courseId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide videoId, courseId, and message',
      });
    }

    // Get course to know the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const feedback = new Feedback({
      videoId,
      courseId,
      adminId: req.user.id,
      message,
      status: 'pending_fix',
    });

    await feedback.save();

    // Create notification for the teacher
    const notification = await Notification.create({
      recipientUser: course.teacher,
      courseId: course._id,
      notificationType: 'video_feedback',
      relatedEntity: { type: 'feedback', id: feedback._id },
      title: 'New Feedback on Video',
      message: `Admin has left a feedback on your video in course "${course.title}".`,
      actionUrl: `/teacher/courses/${course.slug}/videos/${videoId}/exercises`, 
    });

    emitNotification(notification);

    logger.info(`Feedback created by admin ${req.user.id} for video ${videoId}`);

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: feedback,
    });
  } catch (error) {
    logger.error(`Error in createFeedback: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get feedbacks for a video
 * @route   GET /api/feedbacks/video/:videoId
 * @access  Private
 */
const getVideoFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ videoId: req.params.videoId })
      .populate('adminId', 'firstName lastName profilePicture')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    logger.error(`Error in getVideoFeedbacks: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get feedbacks for a course
 * @route   GET /api/feedbacks/course/:courseId
 * @access  Private
 */
const getCourseFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ courseId: req.params.courseId })
      .populate('adminId', 'firstName lastName profilePicture')
      .populate('resolvedBy', 'firstName lastName')
      .populate('videoId', 'title') // populate video title
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    logger.error(`Error in getCourseFeedbacks: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update feedback status
 * @route   PATCH /api/feedbacks/:id/status
 * @access  Private
 */
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending_fix', 'teacher_updated', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.status = status;
    
    // Auto-set resolution details if marked as resolved or ignored
    if (status === 'resolved' || status === 'ignored') {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.user.id;
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error(`Error in updateFeedbackStatus: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createFeedback,
  getVideoFeedbacks,
  getCourseFeedbacks,
  updateFeedbackStatus,
};

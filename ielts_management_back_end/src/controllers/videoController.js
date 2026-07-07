const { Course, Exercise, Video } = require('../models');
const logger = require('../utils/logger');
const { deleteCloudinaryAsset } = require('./uploadController');

const canAccessCourse = async (courseId, user) => {
  const course = await Course.findById(courseId).select('teacher');
  if (!course) {
    return null;
  }

  if (user.role === 'admin') {
    return course;
  }

  if (course.teacher?.toString() !== user.id) {
    return null;
  }

  return course;
};

const syncCourseVideoStats = async (courseId) => {
  try {
    const videos = await Video.find({ courseId });
    const totalVideos = videos.length;
    const totalDurationSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
    const durationInHours = Number((totalDurationSeconds / 3600).toFixed(1));

    await Course.findByIdAndUpdate(courseId, {
      totalVideos,
      durationInHours,
    });
    return { totalVideos, durationInHours };
  } catch (error) {
    logger.error(`Error syncing course video stats: ${error.message}`);
    return null;
  }
};

const getCourseVideos = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await canAccessCourse(courseId, req.user);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await syncCourseVideoStats(courseId);
    const videos = await Video.find({ courseId }).sort({ order: 1 }).populate('exercises');

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    logger.error(`Error in getCourseVideos: ${error.message}`);
    return next(error);
  }
};

const createCourseVideo = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await canAccessCourse(courseId, req.user);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const {
      title,
      description = '',
      duration,
      videoUrl,
      order,
      thumbnailUrl = '',
      skills,
      isPublished = false,
      isMandatory = true,
    } = req.body || {};

    if (!title || !videoUrl || typeof duration !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Title, videoUrl, and duration are required',
      });
    }

    let nextOrder = order;
    if (!nextOrder) {
      const lastVideo = await Video.findOne({ courseId }).sort({ order: -1 }).select('order');
      nextOrder = lastVideo?.order ? lastVideo.order + 1 : 1;
    }

    const video = new Video({
      courseId,
      title,
      description,
      duration,
      videoUrl,
      order: nextOrder,
      thumbnailUrl,
      skills,
      isPublished,
      isMandatory,
    });

    await video.save();
    await syncCourseVideoStats(courseId);

    return res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Video order already exists for this course',
      });
    }

    logger.error(`Error in createCourseVideo: ${error.message}`);
    return next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const course = await canAccessCourse(video.courseId, req.user);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const {
      title,
      description,
      duration,
      videoUrl,
      thumbnailUrl,
      order,
      skills,
      isPublished,
      isMandatory,
      materialUrl,
      materialName,
    } = req.body || {};

    const previousVideoUrl = video.videoUrl;
    const previousThumbnailUrl = video.thumbnailUrl;
    const previousMaterialUrl = video.materialUrl;

    if (typeof title === 'string') video.title = title;
    if (typeof description === 'string') video.description = description;
    if (typeof duration === 'number') video.duration = duration;
    if (typeof videoUrl === 'string') video.videoUrl = videoUrl;
    if (typeof thumbnailUrl === 'string') video.thumbnailUrl = thumbnailUrl;
    if (typeof order === 'number') video.order = order;
    if (Array.isArray(skills)) video.skills = skills;
    if (typeof isPublished === 'boolean') video.isPublished = isPublished;
    if (typeof isMandatory === 'boolean') video.isMandatory = isMandatory;
    if (typeof materialUrl === 'string') video.materialUrl = materialUrl;
    if (typeof materialName === 'string') video.materialName = materialName;

    await video.save();
    await syncCourseVideoStats(video.courseId);

    if (typeof videoUrl === 'string' && previousVideoUrl && previousVideoUrl !== videoUrl) {
      await deleteCloudinaryAsset(previousVideoUrl, 'video');
    }

    if (
      typeof thumbnailUrl === 'string' &&
      previousThumbnailUrl &&
      previousThumbnailUrl !== thumbnailUrl
    ) {
      await deleteCloudinaryAsset(previousThumbnailUrl, 'image');
    }

    if (
      typeof materialUrl === 'string' &&
      previousMaterialUrl &&
      previousMaterialUrl !== materialUrl
    ) {
      await deleteCloudinaryAsset(previousMaterialUrl, 'image');
    }

    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Video order already exists for this course',
      });
    }

    logger.error(`Error in updateVideo: ${error.message}`);
    return next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const course = await canAccessCourse(video.courseId, req.user);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const exerciseCount = await Exercise.countDocuments({ videoId: video._id });
    if (exerciseCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Video này đã có bài tập nên không thể xóa. Hãy xóa bài tập trước rồi thử lại.',
      });
    }

    const videoUrl = video.videoUrl;
    const thumbnailUrl = video.thumbnailUrl;
    const materialUrl = video.materialUrl;
    await video.deleteOne();
    await syncCourseVideoStats(video.courseId);
    await deleteCloudinaryAsset(videoUrl, 'video');
    if (thumbnailUrl) {
      await deleteCloudinaryAsset(thumbnailUrl, 'image');
    }
    if (materialUrl) {
      await deleteCloudinaryAsset(materialUrl, 'image');
    }

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteVideo: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  getCourseVideos,
  createCourseVideo,
  updateVideo,
  deleteVideo,
  syncCourseVideoStats,
};

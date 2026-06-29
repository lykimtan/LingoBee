const { Course, CourseInvitation, Notification, User, Exercise, Student } = require('../models');
const { emitNotification } = require('../socket');
const logger = require('../utils/logger');
const { deleteCloudinaryAsset } = require('./uploadController');
const { getValue, setWithTTL, deleteKeysByPattern, deleteKey } = require('../config/redis');

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      courseDetail,
      learningOutcomes,
      category,
      level,
      teacher,
      teachingAssistants,
      priceTiers,
      courseStartDate,
      courseEndDate,
      publicInfo,
      inviteMessage,
      totalStudents,
      averageRating,
      totalReviews,
      durationInHours,
      estimatedWeeks,
      promoVideoUrl,
    } = req.body;

    // Basic validation
    if (!title || !description || !category || !level || !teacher) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields (title, description, category, level, teacher)',
      });
    }

    // Verify teacher exists
    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or user is not a teacher',
      });
    }

    const course = new Course({
      title,
      description,
      courseDetail,
      learningOutcomes: learningOutcomes || [],
      category,
      level,
      teacher,
      teachingAssistants: teachingAssistants || [],
      priceTiers: priceTiers || [],
      courseStartDate,
      courseEndDate,
      publicInfo,
      status: 'invited',
      totalStudents,
      averageRating,
      totalReviews,
      durationInHours,
      estimatedWeeks,
      promoVideoUrl,
      isPublished: false,
    });

    await course.save();

    const invitation = await CourseInvitation.create({
      course: course._id,
      teacher,
      invitedBy: req.user.id,
      message: inviteMessage || '',
      status: 'pending',
    });

    const notification = await Notification.create({
      recipientUser: teacher,
      courseId: course._id,
      notificationType: 'course_invitation',
      relatedEntity: { type: 'course_invitation', id: invitation._id },
      title: 'Course invitation',
      message: inviteMessage || `You have been invited to teach ${course.title}.`,
      actionUrl: `/courses/invitations/${invitation._id}`,
    });

    emitNotification(notification);

    // Invalidate course caches
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKeysByPattern(`${redisPrefix}courses:public*`);
    await deleteKey(`${redisPrefix}course:public:slug:${course.slug}`);

    logger.info(`Course created by ${req.user.id}: ${course._id}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    logger.error(`Error in createCourse: ${error.message}`);
    if (typeof next === 'function') {
      next(error);
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all courses (Admin/Teacher view - includes unpublished)
 * @route   GET /api/courses
 * @access  Private/Admin
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { category, level, teacher, status, slug, isPublished, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (teacher) query.teacher = teacher;
    if (status) query.status = status;
    if (slug) query.slug = slug;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name avatar email')
      .populate('teachingAssistants', 'name avatar email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error(`Error in getAllCourses: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get courses for current teacher
 * @route   GET /api/courses/my
 * @access  Private/Teacher
 */
const getMyTeachingCourses = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {
      $or: [
        { teacher: req.user.id },
        { teachingAssistants: req.user.id }
      ]
    };

    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .select('title slug category level status totalStudents updatedAt publicInfo')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error(`Error in getMyTeachingCourses: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single course by slug for current teacher
 * @route   GET /api/courses/my/:slug
 * @access  Private/Teacher
 */
const getMyTeachingCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      $or: [
        { teacher: req.user.id },
        { teachingAssistants: req.user.id }
      ]
    })
      .populate('teacher', 'name avatar email bio')
      .populate('teachingAssistants', 'name avatar email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const totalExercises = await Exercise.countDocuments({ courseId: course._id });

    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        totalExercises,
      },
    });
  } catch (error) {
    logger.error(`Error in getMyTeachingCourseBySlug: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Private/Admin
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name avatar email bio')
      .populate('teachingAssistants', 'name avatar email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error(`Error in getCourseById: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single course by slug (Admin)
 * @route   GET /api/courses/slug/:slug
 * @access  Private/Admin
 */
const getAdminCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('teacher', 'name avatar email bio')
      .populate('teachingAssistants', 'name avatar email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error(`Error in getAdminCourseBySlug: ${error.message}`);
    next(error);
  }
};


/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (req.user.role === 'teacher') {
      if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this course',
        });
      }

      if (!['accepted', 'review', 'published'].includes(course.status)) {
        return res.status(403).json({
          success: false,
          message: 'Course is not accepted for teacher updates yet',
        });
      }
    }

    // Verify if teacher exists if it's being updated
    if (req.body.teacher) {
      const teacherUser = await User.findById(req.body.teacher);
      if (!teacherUser || teacherUser.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID or user is not a teacher',
        });
      }
    }

    const updatePayload = { ...req.body };
    if (updatePayload.status) {
      updatePayload.isPublished = updatePayload.status === 'published';
    }

    const existingThumbnail = course.publicInfo?.thumbnail || null;
    const publicInfoPayload = req.body?.publicInfo;
    const hasThumbnailUpdate =
      publicInfoPayload && Object.prototype.hasOwnProperty.call(publicInfoPayload, 'thumbnail');
    const incomingThumbnail = hasThumbnailUpdate ? publicInfoPayload.thumbnail : undefined;

    course = await Course.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'firstName lastName email');

    if (hasThumbnailUpdate && existingThumbnail && existingThumbnail !== incomingThumbnail) {
      await deleteCloudinaryAsset(existingThumbnail, 'image');
    }

    // Invalidate course caches
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKeysByPattern(`${redisPrefix}courses:public*`);
    await deleteKey(`${redisPrefix}course:public:slug:${course.slug}`);

    logger.info(`Course updated by ${req.user.id}: ${course._id}`);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    logger.error(`Error in updateCourse: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await course.deleteOne();

    // Invalidate course caches
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    await deleteKeysByPattern(`${redisPrefix}courses:public*`);
    await deleteKey(`${redisPrefix}course:public:slug:${course.slug}`);

    logger.info(`Course deleted by ${req.user.id}: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: {},
    });
  } catch (error) {
    logger.error(`Error in deleteCourse: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all public courses (For students/visitors)
 * @route   GET /api/courses/public
 * @access  Public
 */
const getPublicCourses = async (req, res, next) => {
  try {
    const { category, level, search } = req.query;

    // Check cache first
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const queryParams = new URLSearchParams(req.query).toString();
    const cacheKey = `${redisPrefix}courses:public${queryParams ? `?${queryParams}` : ''}`;
    
    const cachedData = await getValue(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        count: cachedData.length,
        data: cachedData,
      });
    }

    const query = {
      $or: [{ status: 'published' }, { isPublished: true }],
    };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .select(
        'title slug description category level totalVideos totalExercises priceTiers publicInfo teacher totalStudents averageRating totalReviews durationInHours estimatedWeeks promoVideoUrl learningOutComes'
      )
      .populate('teacher', 'name avatar')
      .sort({ createdAt: -1 });

    // Save to cache for 1 hour
    await setWithTTL(cacheKey, courses, 3600);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error(`Error in getPublicCourses: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get public course by slug
 * @route   GET /api/courses/public/slug/:slug
 * @access  Public
 */
const getPublicCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check cache first
    const redisPrefix = process.env.REDIS_PREFIX || 'ielts:';
    const cacheKey = `${redisPrefix}course:public:slug:${slug}`;
    
    const cachedData = await getValue(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
      });
    }

    const course = await Course.findOne({
      slug,
      $or: [{ status: 'published' }, { isPublished: true }],
    }).populate('teacher', 'name avatar bio')
      .populate('teachingAssistants', 'name avatar bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Save to cache for 1 hour
    await setWithTTL(cacheKey, course, 3600);

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error(`Error in getPublicCourseBySlug: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Request admin to preview course
 * @route   POST /api/courses/:id/request-preview
 * @access  Private/Teacher
 */
const requestCoursePreview = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to request preview for this course',
      });
    }

    course.status = 'review';
    await course.save();

    const admins = await User.find({ role: 'admin' });

    const notifications = admins.map(admin => ({
      recipientUser: admin._id,
      courseId: course._id,
      notificationType: 'course_preview_request',
      relatedEntity: { type: 'course', id: course._id },
      title: 'Yêu cầu xem trước khóa học',
      message: `Giáo viên ${req.user.name || 'ẩn danh'} yêu cầu bạn xem trước khóa học ${course.title}.`,
      actionUrl: `/admin/courses/${course.slug}/preview`,
    }));

    if (notifications.length > 0) {
      const createdNotifications = await Notification.insertMany(notifications);
      createdNotifications.forEach(notif => emitNotification(notif));
    }

    logger.info(`Course preview requested by ${req.user.id}: ${course._id}`);

    res.status(200).json({
      success: true,
      message: 'Preview request sent successfully',
      data: course,
    });
  } catch (error) {
    logger.error(`Error in requestCoursePreview: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get enrolled students for a course
 * @route   GET /api/courses/:id/students
 * @access  Private/Teacher
 */
const getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Ensure teacher or assistant
    if (course.teacher.toString() !== req.user.id && !course.teachingAssistants.map(a => a.toString()).includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const students = await Student.find({ 'enrolledCourses.courseId': req.params.id })
      .populate('userId', 'name avatar email role')
      .lean();

    res.status(200).json({
      success: true,
      data: students.map(s => s.userId).filter(Boolean),
    });
  } catch (error) {
    logger.error(`Error in getCourseStudents: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get detailed course statistics for admin (students, completion rate, reviews, revenue)
 * @route   GET /api/courses/:id/admin-stats
 * @access  Private/Admin
 */
const getCourseAdminStats = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const Comment = require('../models/Comment');
    const Payment = require('../models/Payment');

    const course = await Course.findById(courseId)
      .populate('teacher', 'name avatar email')
      .populate('teachingAssistants', 'name avatar email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
    }

    // 1. Tổng số học viên & Tỷ lệ hoàn thành
    const Video = require('../models/Video');
    const VideoProgress = require('../models/VideoProgress');

    const enrolledStudents = await Student.find({ 'enrolledCourses.courseId': courseId })
      .populate('userId', 'name email avatar')
      .populate('enrolledCourses.learningPath', 'overallProgress isCompleted');
      
    const totalVideos = await Video.countDocuments({ courseId, isPublished: true });
    const totalStudents = enrolledStudents.length;
    let completedStudents = 0;

    const studentList = await Promise.all(enrolledStudents.map(async (s) => {
      const enrollment = s.enrolledCourses?.find(c => (c.courseId?._id || c.courseId).toString() === courseId.toString());
      
      // Tính số video đã xem xong thực tế trong VideoProgress
      const completedVideosCount = await VideoProgress.countDocuments({ studentId: s._id, courseId, isCompleted: true });
      const videoProgressPct = totalVideos > 0 ? Math.round((completedVideosCount / totalVideos) * 100) : 0;
      
      const lpProgress = enrollment?.learningPath?.overallProgress || 0;
      const baseProgress = enrollment?.progress || 0;
      
      // Lấy tiến độ cao nhất và chính xác nhất
      const progress = Math.min(100, Math.max(baseProgress, lpProgress, videoProgressPct));
      const status = (progress >= 100 || enrollment?.status === 'completed' || enrollment?.learningPath?.isCompleted) ? 'completed' : (enrollment?.status || 'active');
      
      if (status === 'completed' || progress >= 100) {
        completedStudents++;
      }
      return {
        _id: s._id,
        user: s.userId,
        progress,
        status,
        enrollmentDate: enrollment?.enrollmentDate || s.createdAt
      };
    }));

    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    // 2. Các bình luận đánh giá của khóa học
    const reviews = await Comment.find({ targetType: 'Course', targetId: courseId, status: { $ne: 'deleted' } })
      .populate('author', 'name avatar email')
      .sort({ createdAt: -1 });

    // 3. Doanh thu của khóa học mang lại
    const payments = await Payment.find({ courseId: courseId, paymentStatus: 'completed' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatar' }
      })
      .sort({ paymentDate: -1, createdAt: -1 });

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.finalAmount || curr.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        course,
        totalStudents,
        completedStudents,
        completionRate,
        studentList,
        reviews,
        totalRevenue,
        payments
      }
    });
  } catch (error) {
    logger.error(`Error in getCourseAdminStats: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getMyTeachingCourses,
  getMyTeachingCourseBySlug,
  getCourseById,
  getAdminCourseBySlug,
  updateCourse,
  deleteCourse,
  getPublicCourses,
  getPublicCourseBySlug,
  requestCoursePreview,
  getCourseStudents,
  getCourseAdminStats
};

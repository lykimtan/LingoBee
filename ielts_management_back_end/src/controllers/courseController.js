const mongoose = require('mongoose');
const { Course, CourseInvitation, Notification, User, Exercise, Student, Video, TeacherProfile } = require('../models');
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
      .select('title slug category level status totalStudents totalVideos durationInHours updatedAt publicInfo')
      .sort({ updatedAt: -1 });

    for (const c of courses) {
      const videos = await Video.find({ courseId: c._id }, 'duration');
      const totalVideos = videos.length;
      const totalDurationSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
      const durationInHours = Number((totalDurationSeconds / 3600).toFixed(1));
      if (c.totalVideos !== totalVideos || c.durationInHours !== durationInHours) {
        c.totalVideos = totalVideos;
        c.durationInHours = durationInHours;
        await Course.findByIdAndUpdate(c._id, { totalVideos, durationInHours });
      }
    }

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
    if (cachedData && cachedData.instructorsShowcase) {
      return res.status(200).json({
        success: true,
        data: cachedData,
      });
    }

    const course = await Course.findOne({
      slug,
      $or: [{ status: 'published' }, { isPublished: true }],
    }).populate('teacher', 'name avatar bio role')
      .populate('teachingAssistants', 'name avatar bio role');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const courseObj = course.toObject();

    // Fetch TeacherProfiles for teacher and TAs
    const userIds = [];
    if (courseObj.teacher?._id) userIds.push(courseObj.teacher._id);
    if (courseObj.teachingAssistants && courseObj.teachingAssistants.length > 0) {
      courseObj.teachingAssistants.forEach(ta => {
        if (ta?._id) userIds.push(ta._id);
      });
    }

    const profiles = await TeacherProfile.find({ userId: { $in: userIds } }).lean();
    const profilesMap = {};
    profiles.forEach(p => {
      if (p.userId) profilesMap[p.userId.toString()] = p;
    });

    const instructors = [courseObj.teacher, ...(courseObj.teachingAssistants || [])].filter(u => u && u._id);
    courseObj.instructorsShowcase = instructors.map(u => {
      const uIdStr = u._id.toString();
      const isMainTeacher = uIdStr === courseObj.teacher?._id?.toString();
      const p = profilesMap[uIdStr] || {};
      return {
        id: uIdStr,
        name: u.name || 'Giảng viên',
        role: isMainTeacher ? 'Giảng viên phụ trách' : 'Trợ giảng chuyên môn',
        title: p.title || (isMainTeacher ? 'Chuyên gia IELTS LingoBee' : 'Trợ giảng IELTS LingoBee'),
        band: p.band || '8.0+',
        bio: p.bio || u.bio || 'Tận tâm đồng hành cùng học viên bứt phá điểm số.',
        teachingPhilosophy: p.teachingPhilosophy || 'Lấy học viên làm trung tâm, tối ưu lộ trình học tập.',
        highlights: p.highlights && p.highlights.length > 0 ? p.highlights : ['Phương pháp giảng dạy hiện đại', 'Chữa bài cặn kẽ chi tiết', 'Đồng hành 1-1 hỗ trợ thắc mắc'],
        certificates: p.certificates || [],
        socialLinks: p.socialLinks || {},
        image: u.avatar || '/homepage/teacher_ngtaif.png'
      };
    });

    // Save to cache for 1 hour
    await setWithTTL(cacheKey, courseObj, 3600);

    res.status(200).json({
      success: true,
      data: courseObj,
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

/**
 * @desc    Get detailed course analytics/stats for teacher course dashboard
 * @route   GET /api/courses/:id/teacher-stats
 * @access  Private/Teacher
 */
const getCourseTeacherStats = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
    }

    // Verify permission (Teacher, Teaching Assistant, or Admin)
    const userIdStr = req.user.id || req.user._id?.toString();
    const isTeacher = course.teacher?.toString() === userIdStr;
    const isAssistant = course.teachingAssistants?.some(a => a.toString() === userIdStr);
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAssistant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem thống kê khóa học này' });
    }

    const Video = require('../models/Video');
    const VideoProgress = require('../models/VideoProgress');
    const ExerciseAttempt = require('../models/AnswerSub');

    const enrolledStudents = await Student.find({ 'enrolledCourses.courseId': courseId })
      .populate('userId', 'name email avatar')
      .populate('enrolledCourses.learningPath', 'overallProgress isCompleted');

    const totalVideos = await Video.countDocuments({ courseId, isPublished: true });
    const totalAttempts = await ExerciseAttempt.countDocuments({ courseId });
    const pendingGrading = await ExerciseAttempt.countDocuments({ courseId, status: 'submitted' });

    let completedStudents = 0;
    let totalProgressSum = 0;

    const progressSegments = {
      completed: 0,  // >= 80%
      inProgress: 0, // 50% - 79%
      started: 0,    // 1% - 49%
      notStarted: 0  // 0%
    };

    const studentList = await Promise.all(enrolledStudents.map(async (s) => {
      const enrollment = s.enrolledCourses?.find(c => (c.courseId?._id || c.courseId).toString() === courseId.toString());
      
      const completedVideosCount = await VideoProgress.countDocuments({ studentId: s._id, courseId, isCompleted: true });
      const videoProgressPct = totalVideos > 0 ? Math.round((completedVideosCount / totalVideos) * 100) : 0;
      
      const lpProgress = enrollment?.learningPath?.overallProgress || 0;
      const baseProgress = enrollment?.progress || 0;
      
      const progress = Math.min(100, Math.max(baseProgress, lpProgress, videoProgressPct));
      const status = (progress >= 100 || enrollment?.status === 'completed' || enrollment?.learningPath?.isCompleted) ? 'completed' : (enrollment?.status || 'active');

      if (status === 'completed' || progress >= 100) {
        completedStudents++;
      }
      totalProgressSum += progress;

      if (progress >= 80) progressSegments.completed++;
      else if (progress >= 50) progressSegments.inProgress++;
      else if (progress > 0) progressSegments.started++;
      else progressSegments.notStarted++;

      const attemptsCount = await ExerciseAttempt.countDocuments({ studentId: s._id, courseId });

      return {
        _id: s._id,
        user: s.userId || { name: 'Học viên ẩn danh', email: 'N/A' },
        progress,
        status,
        attemptsCount,
        enrollmentDate: enrollment?.enrollmentDate || s.createdAt
      };
    }));

    const totalStudents = enrolledStudents.length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
    const avgProgress = totalStudents > 0 ? Math.round(totalProgressSum / totalStudents) : 0;

    // Top students (sort descending by progress then attemptsCount)
    const sortedStudents = [...studentList].sort((a, b) => b.progress - a.progress || b.attemptsCount - a.attemptsCount);
    const topStudents = sortedStudents.slice(0, 5);

    // Needs attention (sort ascending by progress, only take < 40%)
    const needsAttentionStudents = [...studentList]
      .filter(s => s.progress < 40)
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          level: course.level,
          targetBand: course.targetBand
        },
        totalStudents,
        completedStudents,
        completionRate,
        avgProgress,
        totalVideos,
        totalAttempts,
        pendingGrading,
        progressSegments,
        topStudents,
        needsAttentionStudents,
        studentList
      }
    });
  } catch (error) {
    logger.error(`Error in getCourseTeacherStats: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get real enrollment statistics for teacher dashboard
 * @route   GET /api/courses/my/enrollment-stats
 * @access  Private (Teacher)
 */
const getTeacherEnrollmentStats = async (req, res, next) => {
  try {
    const { Student } = require('../models');

    // 1. Find all courses taught or assisted by this teacher
    const courses = await Course.find({
      $or: [
        { teacher: req.user.id },
        { teachingAssistants: req.user.id }
      ]
    }).select('_id title status totalStudents');

    const courseIds = courses.map(c => c._id.toString());
    const publishedCount = courses.filter(c => c.status === 'published').length;

    // 2. Find all enrollments for these courses
    const students = await Student.find({
      'enrolledCourses.courseId': { $in: courseIds }
    }).select('enrolledCourses');

    let totalEnrollments = 0;
    let newThisWeek = 0;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const chartMap = { 'T2': 0, 'T3': 0, 'T4': 0, 'T5': 0, 'T6': 0, 'T7': 0, 'CN': 0 };

    students.forEach(student => {
      if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
        student.enrolledCourses.forEach(enroll => {
          if (enroll.courseId && courseIds.includes(enroll.courseId.toString())) {
            totalEnrollments++;
            const enrollDate = enroll.enrollmentDate ? new Date(enroll.enrollmentDate) : new Date();
            if (enrollDate >= oneWeekAgo) {
              newThisWeek++;
            }
            const dayLabel = daysOfWeek[enrollDate.getDay()];
            if (chartMap[dayLabel] !== undefined) {
              chartMap[dayLabel]++;
            }
          }
        });
      }
    });

    const order = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const maxVal = Math.max(...Object.values(chartMap), 1);
    const todayLabel = daysOfWeek[now.getDay()];

    const chartData = order.map(day => {
      const count = chartMap[day];
      const percent = Math.min(Math.round((count / maxVal) * 100), 100);
      return {
        day,
        value: count > 0 ? Math.max(percent, 20) : 10,
        count,
        active: day === todayLabel
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalEnrollments,
        newThisWeek,
        totalCourses: courses.length,
        publishedCourses: publishedCount,
        chartData
      }
    });
  } catch (error) {
    logger.error(`Error in getTeacherEnrollmentStats: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get detailed list and statistics of students enrolled in teacher's courses
 * @route   GET /api/courses/my/students
 * @access  Private (Teacher)
 */
const getTeacherStudentsList = async (req, res, next) => {
  try {
    const { Student } = require('../models');
    const { courseId, search, status } = req.query;

    const query = {
      $or: [
        { teacher: req.user.id },
        { teachingAssistants: req.user.id }
      ]
    };
    if (courseId && courseId !== 'all') {
      query._id = courseId;
    }

    const courses = await Course.find(query).select('_id title slug level');
    const courseMap = new Map();
    courses.forEach(c => courseMap.set(c._id.toString(), c));

    const targetCourseIds = courses.map(c => c._id.toString());

    const Video = require('../models/Video');
    const VideoProgress = require('../models/VideoProgress');

    // Count published videos per course
    const videos = await Video.aggregate([
      { $match: { courseId: { $in: targetCourseIds.map(id => new mongoose.Types.ObjectId(id)) }, isPublished: true } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);
    const videoCountMap = new Map();
    videos.forEach(v => videoCountMap.set(v._id.toString(), v.count));

    // Find students enrolled in these courses
    const students = await Student.find({
      'enrolledCourses.courseId': { $in: targetCourseIds }
    })
      .populate('userId', 'name email avatar phone')
      .populate('enrolledCourses.learningPath', 'overallProgress isCompleted');

    // Fetch video progress counts for these students across target courses
    const studentIds = students.map(s => s._id);
    const videoProgressList = await VideoProgress.aggregate([
      { $match: { studentId: { $in: studentIds }, courseId: { $in: targetCourseIds.map(id => new mongoose.Types.ObjectId(id)) }, isCompleted: true } },
      { $group: { _id: { studentId: '$studentId', courseId: '$courseId' }, count: { $sum: 1 } } }
    ]);
    const videoProgressMap = new Map();
    videoProgressList.forEach(vp => {
      videoProgressMap.set(`${vp._id.studentId.toString()}_${vp._id.courseId.toString()}`, vp.count);
    });

    // Fetch placement tests for these students/users
    const PlacementTest = require('../models/PlacementTest');
    const userIds = students.map(s => s.userId?._id || s.userId).filter(Boolean);
    const allPlacementTests = await PlacementTest.find({
      $or: [
        { studentId: { $in: userIds } },
        { studentId: { $in: studentIds } }
      ],
      status: { $in: ['completed', 'graded'] }
    })
      .select('_id studentId totalScore questions submittedAt createdAt status')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const placementMap = new Map();
    allPlacementTests.forEach(pt => {
      const sIdStr = pt.studentId.toString();
      if (!placementMap.has(sIdStr)) {
        placementMap.set(sIdStr, []);
      }
      const list = placementMap.get(sIdStr);
      if (list.length < 2) {
        list.push({
          testId: pt._id,
          totalScore: pt.totalScore || 0,
          maxScore: pt.questions ? pt.questions.length : 15,
          date: pt.submittedAt || pt.createdAt || new Date(),
          status: pt.status
        });
      }
    });

    const enrollments = [];
    const uniqueStudentIds = new Set();
    let activeCount = 0;
    let completedCount = 0;
    let totalProgressSum = 0;
    let progressCount = 0;

    students.forEach(student => {
      if (!student.userId) return; // In case user was deleted
      const u = student.userId;

      // Filter by search term if provided
      if (search) {
        const sLower = search.toLowerCase();
        const nameMatch = u.name && u.name.toLowerCase().includes(sLower);
        const emailMatch = u.email && u.email.toLowerCase().includes(sLower);
        if (!nameMatch && !emailMatch) return;
      }

      if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
        student.enrolledCourses.forEach(enroll => {
          const cIdObj = enroll.courseId?._id || enroll.courseId;
          if (!cIdObj) return;
          const cIdStr = cIdObj.toString();

          if (targetCourseIds.includes(cIdStr)) {
            const courseObj = courseMap.get(cIdStr);
            if (!courseObj) return;

            const totalVids = videoCountMap.get(cIdStr) || 0;
            const completedVids = videoProgressMap.get(`${student._id.toString()}_${cIdStr}`) || 0;
            const videoPct = totalVids > 0 ? Math.round((completedVids / totalVids) * 100) : 0;

            const lpProgress = enroll.learningPath?.overallProgress || 0;
            const baseProgress = typeof enroll.progress === 'number' ? enroll.progress : 0;

            let prog = Math.min(100, Math.max(baseProgress, lpProgress, videoPct));
            let enrollStatus = enroll.status || 'active';

            if (enrollStatus === 'completed' || enroll.learningPath?.isCompleted || prog >= 100) {
              enrollStatus = 'completed';
              if (prog === 0) prog = 100;
            }

            if (status && status !== 'all' && enrollStatus !== status) return;

            uniqueStudentIds.add(u._id.toString());
            if (enrollStatus === 'active') activeCount++;
            if (enrollStatus === 'completed') completedCount++;

            totalProgressSum += prog;
            progressCount++;

            const uIdStr = u._id ? u._id.toString() : u.toString();
            const sIdStr = student._id.toString();
            const pTests = placementMap.get(uIdStr) || placementMap.get(sIdStr) || [];

            enrollments.push({
              enrollmentId: `${student._id}_${cIdStr}`,
              studentId: student._id,
              userId: {
                _id: u._id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                phone: u.phone
              },
              courseId: {
                _id: courseObj._id,
                title: courseObj.title,
                slug: courseObj.slug,
                level: courseObj.level
              },
              enrollmentDate: enroll.enrollmentDate || student.createdAt || new Date(),
              progress: prog,
              status: enrollStatus,
              placementTests: pTests
            });
          }
        });
      }
    });

    // Sort enrollments by enrollmentDate desc
    enrollments.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));

    const avgProgress = progressCount > 0 ? Math.round(totalProgressSum / progressCount) : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: uniqueStudentIds.size,
          activeCount,
          completedCount,
          avgProgress,
          totalEnrollments: enrollments.length
        },
        courses: courses.map(c => ({ _id: c._id, title: c.title, level: c.level })),
        enrollments
      }
    });
  } catch (error) {
    logger.error(`Error in getTeacherStudentsList: ${error.message}`);
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
  getCourseAdminStats,
  getCourseTeacherStats,
  getTeacherEnrollmentStats,
  getTeacherStudentsList
};

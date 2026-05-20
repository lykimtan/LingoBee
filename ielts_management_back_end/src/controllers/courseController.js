const { Course, CourseInvitation, Notification, User, Exercise } = require('../models');
const { emitNotification } = require('../socket');
const logger = require('../utils/logger');
const { deleteCloudinaryAsset } = require('./uploadController');

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
      .populate('teacher', 'firstName lastName email profilePicture')
      .populate('teachingAssistants', 'firstName lastName email profilePicture')
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
    const query = { teacher: req.user.id };

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
      teacher: req.user.id,
      slug: req.params.slug,
    })
      .populate('teacher', 'firstName lastName email profilePicture bio')
      .populate('teachingAssistants', 'firstName lastName email profilePicture');

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
      .populate('teacher', 'firstName lastName email profilePicture bio')
      .populate('teachingAssistants', 'firstName lastName email profilePicture');

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
        'title slug description category level totalVideos totalExercises priceTiers publicInfo teacher totalStudents averageRating totalReviews durationInHours estimatedWeeks promoVideoUrl'
      )
      .populate('teacher', 'firstName lastName profilePicture bio')
      .sort({ createdAt: -1 });

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

module.exports = {
  createCourse,
  getAllCourses,
  getMyTeachingCourses,
  getMyTeachingCourseBySlug,
  getCourseById,
  updateCourse,
  deleteCourse,
  getPublicCourses,
};

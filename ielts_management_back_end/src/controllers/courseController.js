const { Course, User } = require('../models');
const logger = require('../utils/logger');

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
      isPublished,
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
    if (!teacherUser || (teacherUser.role !== 'teacher' && teacherUser.role !== 'admin')) {
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
      isPublished: isPublished || false,
    });

    await course.save();

    logger.info(`Course created by ${req.user.id}: ${course._id}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    logger.error(`Error in createCourse: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all courses (Admin/Teacher view - includes unpublished)
 * @route   GET /api/courses
 * @access  Private/Admin
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { category, level, teacher, isPublished, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (teacher) query.teacher = teacher;
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

    // Verify if teacher exists if it's being updated
    if (req.body.teacher) {
      const teacherUser = await User.findById(req.body.teacher);
      if (!teacherUser || (teacherUser.role !== 'teacher' && teacherUser.role !== 'admin')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID or user is not a teacher',
        });
      }
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'firstName lastName email');

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

    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .select(
        'title description category level totalVideos totalExercises priceTiers publicInfo teacher'
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
  getCourseById,
  updateCourse,
  deleteCourse,
  getPublicCourses,
};

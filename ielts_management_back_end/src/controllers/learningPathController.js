const { LearningPath, Student, Course, Video } = require('../models');
const { generateLearningPath } = require('../services/aiPlannerService');
const logger = require('../utils/logger');

/**
 * @desc    Generate personalized learning path via AI
 * @route   POST /api/learning-paths/generate
 * @access  Private/Student
 */
const generatePath = async (req, res, next) => {
  try {
    const { courseId, targetDate, availableDays, hoursPerDay } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can generate learning paths' });
    }

    if (!courseId || !targetDate || !availableDays || !hoursPerDay) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: courseId, targetDate, availableDays, hoursPerDay.' });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Check enrollment
    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === courseId && c.status !== 'dropped'
    );
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này.' });
    }

    // Call AI Service
    let scheduleResult;
    try {
      scheduleResult = await generateLearningPath(courseId, new Date(targetDate), availableDays, hoursPerDay);
    } catch (aiError) {
      return res.status(400).json({ success: false, message: aiError.message });
    }

    // Find if a LearningPath already exists for this student and course
    let learningPath = await LearningPath.findOne({ studentId: student._id, courseId });

    // We need to attach exercises to the lessons since AI only knows about videos
    const videos = await Video.find({ courseId }).populate('exercises');
    const videoMap = new Map();
    videos.forEach(v => {
      videoMap.set(v._id.toString(), v.exercises || []);
    });

    // Format the dailySchedule
    const formattedSchedule = scheduleResult.dailySchedule.map(dayItem => {
      const formattedLessons = dayItem.lessons.map(lessonItem => {
        const exercises = videoMap.get(lessonItem.videoId) || [];
        return {
          videoId: lessonItem.videoId,
          order: lessonItem.order,
          isCompleted: false,
          exercises: exercises.map(ex => ({
            exerciseId: ex._id || ex,
            isCompleted: false,
            score: 0
          }))
        };
      });

      return {
        day: dayItem.day,
        date: new Date(dayItem.date),
        deadline: new Date(dayItem.date + 'T23:59:59'),
        lessons: formattedLessons,
        isCompleted: false
      };
    });

    if (learningPath) {
      // Update existing path
      learningPath.preferences = {
        targetDate: new Date(targetDate),
        availableDays,
        hoursPerDay
      };
      learningPath.dailySchedule = formattedSchedule;
      learningPath.overallProgress = 0; // reset progress
      await learningPath.save();
    } else {
      // Create new path
      learningPath = await LearningPath.create({
        courseId,
        studentId: student._id,
        preferences: {
          targetDate: new Date(targetDate),
          availableDays,
          hoursPerDay
        },
        dailySchedule: formattedSchedule,
        overallProgress: 0
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã tạo lộ trình học tập thành công.',
      data: learningPath
    });

  } catch (error) {
    logger.error(`Error in generatePath: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get student's learning path for a course
 * @route   GET /api/learning-paths/:courseId
 * @access  Private/Student
 */
const getPath = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access learning paths' });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const learningPath = await LearningPath.findOne({ studentId: student._id, courseId })
      .populate('courseId', 'title')
      .populate('dailySchedule.lessons.videoId', 'title duration thumbnailUrl')
      .populate('dailySchedule.lessons.exercises.exerciseId', 'title');

    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Chưa có lộ trình học tập nào được tạo.' });
    }

    res.status(200).json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    logger.error(`Error in getPath: ${error.message}`);
    next(error);
  }
};

module.exports = {
  generatePath,
  getPath
};

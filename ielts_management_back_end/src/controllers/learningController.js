const { Course, Video, VideoProgress, Student, Exercise, ExerciseAttempt, Notification } = require('../models');
const { emitNotification } = require('../socket');
const logger = require('../utils/logger');

/**
 * @desc    Get course learning data (videos, progress) for enrolled student
 * @route   GET /api/learning/course/:slug
 * @access  Private/Student
 */
const getCourseLearningData = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // Verify user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access learning data',
      });
    }

    // Find student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Find course by slug
    const course = await Course.findOne({ slug });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check enrollment
    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === course._id.toString() && c.status !== 'dropped'
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    // Fetch published videos for this course
    const videos = await Video.find({ courseId: course._id, isPublished: true })
      .select('-__v')
      .populate('exercises')
      .sort({ order: 1 });

    // Fetch progress for this student and this course
    const progressList = await VideoProgress.find({
      studentId: student._id,
      courseId: course._id,
    });

    // Merge progress into videos
    const videosWithProgress = videos.map((video) => {
      const progress = progressList.find(
        (p) => p.videoId.toString() === video._id.toString()
      );

      return {
        ...video.toObject(),
        progress: progress || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          totalVideos: course.totalVideos,
        },
        videos: videosWithProgress,
      },
    });
  } catch (error) {
    logger.error(`Error in getCourseLearningData: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update video progress for a student
 * @route   PUT /api/learning/video/:videoId/progress
 * @access  Private/Student
 */
const updateVideoProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { currentTime, isCompleted, duration } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can update learning progress',
      });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Check enrollment
    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === video.courseId.toString() && c.status !== 'dropped'
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    // Find or create progress
    let progress = await VideoProgress.findOne({
      studentId: student._id,
      videoId: video._id,
    });

    const videoDuration = duration || video.duration || 1;

    if (!progress) {
      progress = new VideoProgress({
        studentId: student._id,
        videoId: video._id,
        courseId: video.courseId,
        duration: videoDuration,
      });
    }

    if (currentTime !== undefined) {
      progress.currentTime = currentTime;
    }

    if (isCompleted && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    // Update progress percentage safely
    progress.progressPercentage = Math.min(
      100,
      Math.round((progress.currentTime / videoDuration) * 100)
    );
    progress.lastWatchedAt = new Date();

    if (progress.isCompleted) {
      progress.progressPercentage = 100;
      progress.canAccessNextVideo = true;
    }

    await progress.save();

    // Sync with LearningPath if completed
    if (progress.isCompleted) {
      try {
        const LearningPath = require('../models/LearningPath');
        const learningPath = await LearningPath.findOne({
          studentId: student._id,
          courseId: video.courseId
        });

        if (learningPath) {
          let pathUpdated = false;
          
          for (const day of learningPath.dailySchedule) {
            const lesson = day.lessons.find(l => l.videoId.toString() === video._id.toString());
            if (lesson && !lesson.isCompleted) {
              lesson.isCompleted = true;
              pathUpdated = true;
              
              // Check if all lessons in this day are completed
              const allLessonsCompleted = day.lessons.every(l => l.isCompleted);
              if (allLessonsCompleted && !day.isCompleted) {
                day.isCompleted = true;
                day.completedAt = new Date();
              }
            }
          }

          if (pathUpdated) {
            let totalLessons = 0;
            let completedLessons = 0;
            for (const day of learningPath.dailySchedule) {
              totalLessons += day.lessons.length;
              completedLessons += day.lessons.filter(l => l.isCompleted).length;
            }
            learningPath.overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            
            await learningPath.save();
          }
        }
      } catch (syncError) {
        logger.error(`Error syncing progress to LearningPath: ${syncError.message}`);
      }
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error(`Error in updateVideoProgress: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get resources (material, exercises) for a video
 * @route   GET /api/learning/video/:videoId/resources
 * @access  Private/Student
 */
const getVideoResources = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access learning resources',
      });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const video = await Video.findById(videoId).populate('exercises');
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === video.courseId.toString() && c.status !== 'dropped'
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        materialUrl: video.materialUrl,
        materialName: video.materialName,
        exercises: video.exercises || [],
      },
    });
  } catch (error) {
    logger.error(`Error in getVideoResources: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get exercise details and latest attempt for a student
 * @route   GET /api/learning/exercise/:exerciseId
 * @access  Private/Student
 */
const getExerciseForStudent = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access exercises' });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    const isEnrolled = student.enrolledCourses.some(
      (c) => c.courseId.toString() === exercise.courseId.toString() && c.status !== 'dropped'
    );

    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Get the latest attempt
    let attempt = await ExerciseAttempt.findOne({
      studentId: student._id,
      exerciseId: exercise._id,
    }).sort({ attemptNumber: -1 })
      .populate('gradedBy', 'name avatar');

    const isCompleted = attempt && (attempt.status === 'submitted' || attempt.status === 'graded');

    // Ensure questions array doesn't leak correctAnswers to the student unless completed
    const sanitizedQuestions = exercise.questions.map((q) => {
      const { correctOptionId, correctAnswers, ...safeQuestion } = q.toObject();
      if (isCompleted) {
        if (correctOptionId) safeQuestion.correctOptionId = correctOptionId;
        if (correctAnswers) safeQuestion.correctAnswers = correctAnswers;
      }
      return safeQuestion;
    });

    res.status(200).json({
      success: true,
      data: {
        exercise: {
          ...exercise.toObject(),
          questions: sanitizedQuestions,
        },
        attempt,
      },
    });
  } catch (error) {
    logger.error(`Error in getExerciseForStudent: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Save exercise progress (draft)
 * @route   PUT /api/learning/exercise/:exerciseId/progress
 * @access  Private/Student
 */
const saveExerciseProgress = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can save progress' });
    }

    const student = await Student.findOne({ userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

    // Get latest attempt or create one
    let attempt = await ExerciseAttempt.findOne({
      studentId: student._id,
      exerciseId: exercise._id,
    }).sort({ attemptNumber: -1 });

    if (!attempt || attempt.status !== 'in_progress') {
      attempt = new ExerciseAttempt({
        studentId: student._id,
        exerciseId: exercise._id,
        courseId: exercise.courseId,
        status: 'in_progress',
        answers: [],
      });
    }

    if (answers && Array.isArray(answers)) {
      attempt.answers = answers.map(ans => {
        const q = exercise.questions.find((quest) => quest._id.toString() === ans.questionId.toString());
        return {
          ...ans,
          questionSnapshot: q ? {
            questionText: q.questionText,
            options: q.options || [],
          } : undefined,
        };
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
      data: attempt,
    });
  } catch (error) {
    logger.error(`Error in saveExerciseProgress: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Submit exercise attempt
 * @route   POST /api/learning/exercise/:exerciseId/submit
 * @access  Private/Student
 */
const submitExerciseAttempt = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can submit exercises' });
    }

    const student = await Student.findOne({ userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

    // Get latest attempt or create
    let attempt = await ExerciseAttempt.findOne({
      studentId: student._id,
      exerciseId: exercise._id,
    }).sort({ attemptNumber: -1 });

    if (!attempt || attempt.status !== 'in_progress') {
      attempt = new ExerciseAttempt({
        studentId: student._id,
        exerciseId: exercise._id,
        courseId: exercise.courseId,
        status: 'in_progress',
      });
    }

    if (answers && Array.isArray(answers)) {
      attempt.answers = answers.map(ans => {
        const q = exercise.questions.find((quest) => quest._id.toString() === ans.questionId.toString());
        return {
          ...ans,
          questionSnapshot: q ? {
            questionText: q.questionText,
            options: q.options || [],
          } : undefined,
        };
      });
    }

    attempt.status = 'submitted';

    // Auto-grade multipleChoice & fillBlank
    let needsManualGrading = false;

    attempt.answers.forEach((ans) => {
      const q = exercise.questions.find((quest) => quest._id.toString() === ans.questionId.toString());
      if (q) {
        if (q.questionType === 'multipleChoice') {
          ans.isCorrect = ans.selectedOptionId === q.correctOptionId;
          ans.score = ans.isCorrect ? 10 : 0;
        } else if (q.questionType === 'fillBlank') {
          // Simplistic checking, case-insensitive
          const isCorrect = ans.blankAnswers.some(userAns =>
            q.correctAnswers.some(corr => corr.toLowerCase() === userAns.toLowerCase())
          );
          ans.isCorrect = isCorrect;
          ans.score = isCorrect ? 10 : 0;
        } else {
          // essay or speaking
          needsManualGrading = true;
        }
      }
    });

    if (!needsManualGrading) {
      attempt.status = 'graded';
      attempt.gradedAt = new Date();
    } else {
      const course = await Course.findById(exercise.courseId);
      if (course && course.teacher) {
        const notification = await Notification.create({
          recipientUser: course.teacher,
          courseId: course._id,
          notificationType: 'exercise_submitted',
          relatedEntity: {
            type: 'exercise',
            id: attempt._id,
          },
          title: 'Có bài tập chờ chấm điểm',
          message: `Học viên vừa nộp bài tập "${exercise.title}" chờ bạn chấm điểm.`,
          actionUrl: `/teacher/grading`
        });
        emitNotification(notification);
      }
    }

    await attempt.save();

    const questionsWithAnswers = exercise.questions.map((q) => q.toObject());

    res.status(200).json({
      success: true,
      message: 'Exercise submitted successfully',
      data: {
        attempt,
        questions: questionsWithAnswers,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    logger.error(`Error in submitExerciseAttempt: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Grade exercise attempt (Teacher)
 * @route   POST /api/learning/teacher/attempts/:attemptId/grade
 * @access  Private/Teacher
 */
const gradeExerciseAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers, gradeNote } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can grade exercises' });
    }

    const attempt = await ExerciseAttempt.findById(attemptId).populate('exerciseId');
    if (!attempt) return res.status(404).json({ success: false, message: 'Exercise attempt not found' });

    if (req.user.role !== 'admin') {
      const course = await Course.findById(attempt.courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      if (course.teacher.toString() !== userId && !(course.teachingAssistants && course.teachingAssistants.includes(userId))) {
        return res.status(403).json({ success: false, message: 'You are not authorized to grade this course' });
      }
    }

    if (attempt.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Can only grade submitted attempts' });
    }

    // Update answers with teacher feedback and scores
    if (answers && Array.isArray(answers)) {
      answers.forEach(gradedAns => {
        const attemptAns = attempt.answers.find(a => a.questionId.toString() === gradedAns.questionId.toString());
        if (attemptAns) {
          if (gradedAns.score !== undefined) attemptAns.score = gradedAns.score;
          if (gradedAns.isCorrect !== undefined) attemptAns.isCorrect = gradedAns.isCorrect;
          if (gradedAns.teacherFeedback !== undefined) attemptAns.teacherFeedback = gradedAns.teacherFeedback;
        }
      });
    }

    attempt.gradeNote = gradeNote || '';
    attempt.status = 'graded';
    attempt.gradedBy = userId;
    attempt.gradedAt = new Date();

    // The pre('save') hook in AnswerSub.js will automatically calculate the totalScore
    await attempt.save();

    // Send notification to student
    const student = await Student.findById(attempt.studentId);
    if (student) {
      const notification = await Notification.create({
        studentId: student._id,
        recipientUser: student.userId,
        courseId: attempt.courseId,
        notificationType: 'exercise_graded',
        relatedEntity: {
          type: 'exercise',
          id: attempt._id,
        },
        title: 'Bài tập đã được chấm',
        message: `Bài tập "${attempt.exerciseId?.title || 'tự luận'}" của bạn đã được giáo viên chấm. Xem điểm và nhận xét ngay!`,
      });
      emitNotification(notification);
    }

    res.status(200).json({
      success: true,
      message: 'Grading completed successfully',
      data: attempt,
    });
  } catch (error) {
    logger.error(`Error in gradeExerciseAttempt: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get grading queue (submitted attempts for teacher's courses)
 * @route   GET /api/learning/teacher/grading-queue
 * @access  Private/Teacher
 */
const getGradingQueue = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can access grading queue' });
    }

    // Find all courses where this user is the teacher
    const courses = await Course.find({ teacher: userId }).select('_id');
    const courseIds = courses.map(c => c._id);

    // Find exercises that require manual grading
    const manualExercises = await Exercise.find({
      courseId: { $in: courseIds },
      'questions.questionType': { $in: ['essay', 'speaking'] }
    }).select('_id');
    const manualExerciseIds = manualExercises.map(ex => ex._id);

    // Get all submitted attempts for these exercises
    const attempts = await ExerciseAttempt.find({
      courseId: { $in: courseIds },
      exerciseId: { $in: manualExerciseIds },
      status: 'submitted'
    })
      .populate('exerciseId', 'title')
      .populate('studentId')
      .sort({ completedAt: 1, submittedAt: 1, createdAt: 1 }); // Sort by oldest first

    // We also want to populate the User fields of the Student for name and avatar
    await Student.populate(attempts, { path: 'studentId.userId', select: 'fullName email avatar' });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    logger.error(`Error in getGradingQueue: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all submitted and graded attempts for a specific course
 * @route   GET /api/learning/teacher/courses/:courseId/attempts
 * @access  Private/Teacher
 */
const getCourseAttemptsForGrading = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can access course grading' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== userId && !(course.teachingAssistants && course.teachingAssistants.includes(userId))) {
      return res.status(403).json({ success: false, message: 'You are not authorized to grade this course' });
    }

    // Find exercises that require manual grading
    const manualExercises = await Exercise.find({
      courseId,
      'questions.questionType': { $in: ['essay', 'speaking'] }
    }).select('_id');
    const manualExerciseIds = manualExercises.map(ex => ex._id);

    const attempts = await ExerciseAttempt.find({
      courseId,
      exerciseId: { $in: manualExerciseIds },
      status: { $in: ['submitted', 'graded'] }
    })
      .populate('exerciseId', 'title')
      .populate('studentId')
      .sort({ completedAt: -1, submittedAt: -1, createdAt: -1 });

    await Student.populate(attempts, { path: 'studentId.userId', select: 'fullName email avatar' });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    logger.error(`Error in getCourseAttemptsForGrading: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get details of an attempt for grading
 * @route   GET /api/learning/teacher/attempts/:attemptId
 * @access  Private/Teacher
 */
const getAttemptDetailForGrading = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only teachers can access attempt details' });
    }

    const attempt = await ExerciseAttempt.findById(attemptId)
      .populate('studentId')
      .populate({
        path: 'exerciseId',
        select: 'title description questions type'
      });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (req.user.role !== 'admin') {
      const course = await Course.findById(attempt.courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      if (course.teacher.toString() !== req.user.id && !(course.teachingAssistants && course.teachingAssistants.includes(req.user.id))) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access attempts for this course' });
      }
    }

    // Populate user info for student
    await Student.populate(attempt, { path: 'studentId.userId', select: 'fullName email avatar' });

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    logger.error(`Error in getAttemptDetailForGrading: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Grade speaking exercise with AI
 * @route   POST /api/learning/exercise/:exerciseId/grade-ai
 * @access  Private/Student
 */
const gradeSpeakingWithAI = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can request AI grading' });
    }

    const student = await Student.findOne({ userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Fetch the latest attempt
    let attempt = await ExerciseAttempt.findOne({
      studentId: student._id,
      exerciseId: exerciseId,
    }).sort({ attemptNumber: -1 });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No attempt found to grade' });
    }

    // --- CHECK SPAM LIMIT ---
    if (attempt.aiAssessmentCount >= 3) {
      return res.status(403).json({ success: false, message: 'Bạn đã hết lượt chấm điểm AI cho bài tập này (Tối đa 3 lần).' });
    }

    const azureSpeechService = require('../services/azureSpeechService');

    // We will assess all speaking answers that have audio
    let assessedCount = 0;
    for (const ans of attempt.answers) {
      // Chỉ chấm những câu chưa có aiAssessment hoặc học viên vừa thay đổi audio (aiAssessment bị làm rỗng) hoặc bị lỗi NaN
      console.log(`Checking answer ${ans._id} - audioUrl: ${ans.audioRecordUrl}, aiAssessment:`, ans.aiAssessment);
      if (ans.questionType === 'speaking' && ans.audioRecordUrl && (!ans.aiAssessment || ans.aiAssessment.pronunciationScore == null || isNaN(ans.aiAssessment.pronunciationScore))) {
        try {
          const aiResult = await azureSpeechService.assessPronunciation(ans.audioRecordUrl);
          ans.aiAssessment = aiResult;

          // Optionally, assign a score based on pronunciation
          // Example: IELTS speaking is loosely mapped to HundredMark, let's just store it.
          ans.isCorrect = aiResult.pronunciationScore > 60;

          assessedCount++;
        } catch (err) {
          logger.error(`AI grading failed for answer ${ans._id}: ${err.message}`);
          // Continue with other answers
        }
      }
    }

    if (assessedCount > 0) {
      attempt.aiAssessmentCount += 1;
      await attempt.save();
    }

    res.status(200).json({
      success: true,
      message: `AI grading completed for ${assessedCount} speaking question(s)`,
      data: attempt
    });

  } catch (error) {
    logger.error(`Error in gradeSpeakingWithAI: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Explain question via AI Academic Tutor
 * @route   POST /api/learning/explain
 * @access  Private/Student
 */
const explainQuestionWithAI = async (req, res, next) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    const { createGoogleGenerativeAI } = require('@ai-sdk/google');
    const { streamText, convertToModelMessages } = require('ai');

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    const systemPrompt = `Bạn là một gia sư IELTS chuyên nghiệp và tận tâm (IELTS Academic Tutor), Tên của bạn là Bee Thông Thái. 
          Bạn đang hỗ trợ một học viên giải đáp thắc mắc về một câu hỏi bài tập IELTS cụ thể.

          Dưới đây là thông tin về câu hỏi mà học viên đang hỏi:
          - Câu hỏi/Yêu cầu: ${context?.questionText || 'Không rõ'}
          - Lựa chọn của học viên: ${context?.studentAnswer || 'Trống'}
          - Đáp án đúng: ${context?.correctAnswer || 'Không cung cấp'}
          - Loại câu hỏi: ${context?.questionType || 'Khác'}
          ${context?.explanation ? `- Giải thích của hệ thống: ${context.explanation}` : ''}
          ${context?.transcript ? `- Đoạn Transcript/Bài đọc liên quan: ${context.transcript}` : ''}

          Nhiệm vụ của bạn:
          1. Đọc và hiểu kỹ tại sao học viên lại chọn đáp án sai (nếu họ sai) hoặc giải thích tại sao đáp án đúng lại chính xác.
          2. Trả lời một cách có tính sư phạm: Giải thích rõ ràng các từ vựng, cấu trúc ngữ pháp, hoặc đoạn văn liên quan trong bài đọc/nghe (nếu có).
          3. KHÔNG đưa ngay đáp án nếu học viên hỏi bài chưa làm, nhưng vì ở đây là phần chữa bài, bạn hãy phân tích trực tiếp vào đáp án.
          4. Luôn xưng  "mình" và gọi học viên là "bạn". Giọng điệu chuyên nghiệp, khuyến khích.
          5. Không sử dụng các tool bán hàng hay tư vấn khóa học.`;

    const safeMessages = messages.map(msg => {
      if (!msg.parts && msg.content) {
        return {
          ...msg,
          parts: [{ type: 'text', text: msg.content }]
        };
      }
      return msg;
    });

    let modelMessages = [];
    try {
      modelMessages = await convertToModelMessages(safeMessages);
    } catch (e) {
      console.error('CONVERT ERROR:', e);
      const filteredMessages = safeMessages.filter(m => m.role !== 'tool');
      modelMessages = await convertToModelMessages(filteredMessages);
    }

    // console.log('\n================ DỮ LIỆU GÓI CHO AI (AITUTOR) ================');
    // console.log('[System Prompt]:\n', systemPrompt);
    // console.log('\n[Messages]:\n', JSON.stringify(modelMessages, null, 2));
    // console.log('==============================================================\n');

    const result = streamText({
      model: googleProvider('gemini-flash-lite-latest'),
      system: systemPrompt,
      messages: modelMessages,
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    logger.error(`Error in explainQuestionWithAI: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @desc    Get Azure Speech Token for frontend direct use
 * @route   GET /api/learning/azure-speech-token
 * @access  Private
 */
const getSpeechToken = async (req, res, next) => {
  try {
    const azureSpeechService = require('../services/azureSpeechService');
    const tokenData = await azureSpeechService.getAzureSpeechToken();
    
    res.status(200).json({
      success: true,
      data: tokenData
    });
  } catch (error) {
    logger.error(`Error in getSpeechToken: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate speech token' });
  }
};

module.exports = {
  getCourseLearningData,
  updateVideoProgress,
  getVideoResources,
  getExerciseForStudent,
  saveExerciseProgress,
  submitExerciseAttempt,
  gradeExerciseAttempt,
  getGradingQueue,
  getCourseAttemptsForGrading,
  getAttemptDetailForGrading,
  gradeSpeakingWithAI,
  explainQuestionWithAI,
  getSpeechToken,
};

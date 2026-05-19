const { Course, Exercise, Video } = require('../models');
const logger = require('../utils/logger');
const { deleteCloudinaryAsset } = require('./uploadController');

const SKILLS = ['reading', 'writing', 'listening', 'speaking'];
const QUESTION_TYPES = ['multipleChoice', 'fillBlank', 'essay', 'speaking'];

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

const normalizeQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: 'Questions must be a non-empty array' };
  }

  const normalized = [];

  for (const question of questions) {
    const questionText =
      typeof question.questionText === 'string' ? question.questionText.trim() : '';
    const questionType = typeof question.questionType === 'string' ? question.questionType : '';
    const explanation = typeof question.explanation === 'string' ? question.explanation.trim() : '';
    const skill = SKILLS.includes(question.skill) ? question.skill : 'reading';
    const audioUrl = typeof question.audioUrl === 'string' ? question.audioUrl.trim() : '';
    const transcript = typeof question.transcript === 'string' ? question.transcript.trim() : '';

    if (!questionText) {
      return { error: 'Question text is required' };
    }

    if (!QUESTION_TYPES.includes(questionType)) {
      return { error: `Unsupported question type: ${questionType}` };
    }

    const base = {
      questionText,
      explanation,
      skill,
      questionType,
    };

    if (questionType === 'multipleChoice') {
      const options = Array.isArray(question.options) ? question.options : [];
      const normalizedOptions = options
        .map((option) => ({
          id: String(option.id || '').trim(),
          text: typeof option.text === 'string' ? option.text.trim() : '',
        }))
        .filter((option) => option.id && option.text);

      if (normalizedOptions.length < 2) {
        return { error: 'Multiple choice questions require at least 2 options' };
      }

      const correctOptionId = String(question.correctOptionId || '').trim();

      if (!normalizedOptions.some((option) => option.id === correctOptionId)) {
        return { error: 'Correct option id must match one of the options' };
      }

      if (skill === 'listening' && !audioUrl) {
        return { error: 'Listening multiple choice questions require an audio URL' };
      }

      normalized.push({
        ...base,
        options: normalizedOptions,
        correctOptionId,
        audioUrl: skill === 'listening' ? audioUrl : '',
        transcript: skill === 'listening' ? transcript : '',
      });
      continue;
    }

    if (questionType === 'fillBlank') {
      const correctAnswers = Array.isArray(question.correctAnswers)
        ? question.correctAnswers.map((item) => String(item).trim()).filter(Boolean)
        : [];

      if (correctAnswers.length === 0) {
        return { error: 'Fill in the blank requires at least one correct answer' };
      }

      if (skill === 'listening' && !audioUrl) {
        return { error: 'Listening fill blank questions require an audio URL' };
      }

      normalized.push({
        ...base,
        correctAnswers,
        isExactMatch: Boolean(question.isExactMatch),
        audioUrl: skill === 'listening' ? audioUrl : '',
        transcript: skill === 'listening' ? transcript : '',
      });
      continue;
    }

    if (questionType === 'essay') {
      const minWords = Number(question.minWords || 0);
      normalized.push({
        ...base,
        minWords: Number.isFinite(minWords) && minWords > 0 ? minWords : 0,
      });
      continue;
    }

    if (questionType === 'speaking') {
      const audioPromptUrl =
        typeof question.audioPromptUrl === 'string' ? question.audioPromptUrl.trim() : '';
      const timeLimitSeconds = Number(question.timeLimitSeconds || 0);
      normalized.push({
        ...base,
        audioPromptUrl,
        timeLimitSeconds:
          Number.isFinite(timeLimitSeconds) && timeLimitSeconds > 0 ? timeLimitSeconds : undefined,
      });
      continue;
    }
  }

  return { normalized };
};

const getVideoExercises = async (req, res, next) => {
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

    const exercises = await Exercise.find({ videoId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    logger.error(`Error in getVideoExercises: ${error.message}`);
    return next(error);
  }
};

const createVideoExercise = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, description = '', questions } = req.body || {};

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

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

    const { normalized, error } = normalizeQuestions(questions);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const exercise = new Exercise({
      videoId: video._id,
      courseId: video.courseId,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      questions: normalized,
    });

    await exercise.save();

    return res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise,
    });
  } catch (error) {
    logger.error(`Error in createVideoExercise: ${error.message}`);
    return next(error);
  }
};

const getExerciseById = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const course = await canAccessCourse(exercise.courseId, req.user);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    logger.error(`Error in getExerciseById: ${error.message}`);
    return next(error);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const { title, description, questions } = req.body || {};

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const course = await canAccessCourse(exercise.courseId, req.user);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (typeof title === 'string') {
      exercise.title = title.trim();
    }

    if (typeof description === 'string') {
      exercise.description = description.trim();
    }

    if (questions !== undefined) {
      const { normalized, error } = normalizeQuestions(questions);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }
      // detect removed audio assets and delete them from Cloudinary
      try {
        const previousUrls = new Set();
        for (const q of exercise.questions || []) {
          if (q.audioUrl) previousUrls.add(q.audioUrl);
          if (q.audioPromptUrl) previousUrls.add(q.audioPromptUrl);
        }

        const newUrls = new Set();
        for (const nq of normalized) {
          if (nq.audioUrl) newUrls.add(nq.audioUrl);
          if (nq.audioPromptUrl) newUrls.add(nq.audioPromptUrl);
        }

        for (const url of previousUrls) {
          if (!newUrls.has(url)) {
            // best-effort delete, resource type for audio uploads is 'video'
            // do not await long-running deletes to avoid blocking, but handle errors
            deleteCloudinaryAsset(url, 'video').catch((err) => {
              logger.warn(`Failed to delete removed audio ${url}: ${err.message}`);
            });
          }
        }
      } catch (err) {
        logger.warn(`Error while cleaning up removed assets: ${err.message}`);
      }

      exercise.questions = normalized;
    }

    await exercise.save();

    return res.status(200).json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise,
    });
  } catch (error) {
    logger.error(`Error in updateExercise: ${error.message}`);
    return next(error);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const course = await canAccessCourse(exercise.courseId, req.user);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await exercise.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteExercise: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  createVideoExercise,
  getVideoExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
};

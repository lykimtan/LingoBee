const { PlacementQuestion, PlacementTest } = require('../models');
const logger = require('../utils/logger');
const { deleteCloudinaryAsset } = require('./uploadController');

/**
 * @desc    Create a new placement question
 * @route   POST /api/placement-questions
 * @access  Private (Admin/Teacher)
 */
const createQuestion = async (req, res, next) => {
  try {
    const { questionText, difficulty, questionType, isActive, ...typeSpecificData } = req.body;

    if (!questionText || !questionType) {
      return res.status(400).json({
        success: false,
        message: 'questionText and questionType are required',
      });
    }

    const questionData = {
      questionText: questionText.trim(),
      difficulty: difficulty || 'medium',
      questionType,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
      ...typeSpecificData,
    };

    const question = new PlacementQuestion(questionData);
    await question.save();
    
    // Populate createdBy before returning
    await question.populate('createdBy', 'name email avatar');

    return res.status(201).json({
      success: true,
      message: 'Placement question created successfully',
      data: question,
    });
  } catch (error) {
    logger.error(`Error in createQuestion: ${error.message}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

/**
 * @desc    Get all placement questions (with pagination and filters)
 * @route   GET /api/placement-questions
 * @access  Private (Admin/Teacher)
 */
const getQuestions = async (req, res, next) => {
  try {
    const { difficulty, questionType, isActive, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (questionType) query.questionType = questionType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await PlacementQuestion.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlacementQuestion.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`Error in getQuestions: ${error.message}`);
    return next(error);
  }
};

/**
 * @desc    Get a single placement question by ID
 * @route   GET /api/placement-questions/:id
 * @access  Private (Admin/Teacher)
 */
const getQuestionById = async (req, res, next) => {
  try {
    const question = await PlacementQuestion.findById(req.params.id).populate('createdBy', 'name email avatar');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    logger.error(`Error in getQuestionById: ${error.message}`);
    return next(error);
  }
};

/**
 * @desc    Update a placement question
 * @route   PUT /api/placement-questions/:id
 * @access  Private (Admin/Teacher)
 */
const updateQuestion = async (req, res, next) => {
  try {
    const question = await PlacementQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const updates = req.body;
    
    // Xử lý việc xóa file audio cũ nếu có file mới được upload
    if (updates.audioUrl && question.audioUrl && updates.audioUrl !== question.audioUrl) {
      deleteCloudinaryAsset(question.audioUrl, 'video').catch((err) => {
        logger.warn(`Failed to delete old audio ${question.audioUrl}: ${err.message}`);
      });
    }
    
    if (updates.audioPromptUrl && question.audioPromptUrl && updates.audioPromptUrl !== question.audioPromptUrl) {
      deleteCloudinaryAsset(question.audioPromptUrl, 'video').catch((err) => {
        logger.warn(`Failed to delete old audio ${question.audioPromptUrl}: ${err.message}`);
      });
    }

    // Không cho phép đổi questionType
    if (updates.questionType && updates.questionType !== question.questionType) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change question type after creation',
      });
    }

    Object.assign(question, updates);
    await question.save();

    return res.status(200).json({
      success: true,
      message: 'Placement question updated successfully',
      data: question,
    });
  } catch (error) {
    logger.error(`Error in updateQuestion: ${error.message}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

/**
 * @desc    Delete a placement question
 * @route   DELETE /api/placement-questions/:id
 * @access  Private (Admin/Teacher)
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await PlacementQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Xóa file audio liên quan nếu có
    if (question.audioUrl) {
      deleteCloudinaryAsset(question.audioUrl, 'video').catch((err) => {
        logger.warn(`Failed to delete audio ${question.audioUrl}: ${err.message}`);
      });
    }
    
    if (question.audioPromptUrl) {
      deleteCloudinaryAsset(question.audioPromptUrl, 'video').catch((err) => {
        logger.warn(`Failed to delete audio ${question.audioPromptUrl}: ${err.message}`);
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Placement question deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteQuestion: ${error.message}`);
    return next(error);
  }
};

/**
 * @desc    Get performance analytics / accuracy rate for placement question types
 * @route   GET /api/placement-questions/statistics/performance
 * @access  Private (Admin/Teacher)
 */
const getQuestionPerformanceStats = async (req, res, next) => {
  try {
    const stats = await PlacementTest.aggregate([
      { $match: { status: { $in: ['completed', 'graded'] } } },
      { $unwind: '$answers' },
      {
        $lookup: {
          from: 'placementquestions',
          localField: 'answers.questionId',
          foreignField: '_id',
          as: 'questionInfo',
        },
      },
      { $unwind: '$questionInfo' },
      {
        $group: {
          _id: '$questionInfo.questionType',
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$questionInfo.questionType', ['multipleChoice', 'listeningChoice']] },
                    { $gt: ['$answers.score', 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalScore: { $sum: '$answers.score' },
        },
      },
    ]);

    const formattedStats = {
      multipleChoice: { totalAttempts: 0, correctAttempts: 0, accuracyRate: 0 },
      listeningChoice: { totalAttempts: 0, correctAttempts: 0, accuracyRate: 0 },
      speaking: { totalAttempts: 0, totalScore: 0, averageScore: 0 },
    };

    stats.forEach((item) => {
      const type = item._id;
      if (type === 'multipleChoice' || type === 'listeningChoice') {
        const rate = item.totalAttempts > 0 ? Math.round((item.correctAttempts / item.totalAttempts) * 100) : 0;
        formattedStats[type] = {
          totalAttempts: item.totalAttempts,
          correctAttempts: item.correctAttempts,
          accuracyRate: rate,
        };
      } else if (type === 'speaking') {
        const avg = item.totalAttempts > 0 ? Number((item.totalScore / item.totalAttempts).toFixed(1)) : 0;
        formattedStats[type] = {
          totalAttempts: item.totalAttempts,
          totalScore: item.totalScore,
          averageScore: avg,
        };
      }
    });

    return res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    logger.error(`Error in getQuestionPerformanceStats: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionPerformanceStats,
};

const { PlacementTest, PlacementQuestion } = require('../models');
const logger = require('../utils/logger');

/**
 * @desc    Start a new placement test
 * @route   POST /api/placement-tests/start
 * @access  Private
 */
const startTest = async (req, res, next) => {
  try {
    // Luôn xóa bỏ các bài test cũ đang làm dở để học viên làm lại đề mới từ đầu
    await PlacementTest.deleteMany({
      studentId: req.user._id,
      status: 'in_progress',
    });

    // Fetch 15 random active questions: 8 multipleChoice, 6 listeningChoice, 1 speaking
    const questions = await PlacementQuestion.aggregate([
      { $match: { isActive: true } },
      {
        $facet: { //facet cho phép chạy nhiều luồng song song trên 1 tập dữ liệu
          multipleChoice: [
            { $match: { questionType: 'multipleChoice' } },
            { $sample: { size: 8 } }
          ],
          listeningChoice: [
            { $match: { questionType: 'listeningChoice' } },
            { $sample: { size: 6 } }
          ],
          speaking: [
            { $match: { questionType: 'speaking' } },
            { $sample: { size: 1 } }
          ]
        }
      },
      {
        $project: {
          allQuestions: { $concatArrays: ["$multipleChoice", "$listeningChoice", "$speaking"] }
        }
      },
      { $unwind: "$allQuestions" },
      { $replaceRoot: { newRoot: "$allQuestions" } }//định nghĩa lại cấu trúc dữ liệu đầu ra
    ]);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không đủ tài nguyên câu hỏi để có thể tạo ra một đề kiểm tra năng lực.',
      });
    }

    // Map questions to initial answers array
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIds: [],
      audioSubmissionUrl: null,
      score: 0,
    }));

    // Create new test
    const newTest = await PlacementTest.create({
      studentId: req.user._id,
      questions: questions.map((q) => q._id),
      answers,
      timeLimitMinutes: 12, // Default 30 minutes
      status: 'in_progress',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã bắt đầu bài kiểm tra',
      data: newTest,
    });
  } catch (error) {
    logger.error(`Error in startTest: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit answers for a test
 * @route   POST /api/placement-tests/:id/submit
 * @access  Private
 */
const submitTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOptionIds, audioSubmissionUrl }

    const test = await PlacementTest.findOne({ _id: id, studentId: req.user._id });

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Test is already completed' });
    }

    // Fetch all questions to grade them
    const testQuestions = await PlacementQuestion.find({ _id: { $in: test.questions } });

    let totalScore = 0;
    const gradedAnswers = test.answers.map((testAns) => {
      // Find user submitted answer for this question
      const submittedAns = answers.find(a => a.questionId.toString() === testAns.questionId.toString());

      const questionDef = testQuestions.find(q => q._id.toString() === testAns.questionId.toString());

      if (!questionDef) return testAns;

      let score = 0;

      if (submittedAns) {
        testAns.selectedOptionIds = submittedAns.selectedOptionIds || [];
        testAns.audioSubmissionUrl = submittedAns.audioSubmissionUrl || null;

        // Auto grade MCQ and Listening
        if (questionDef.questionType === 'multipleChoice' || questionDef.questionType === 'listeningChoice') {
          // Compare correctOptionIds with selectedOptionIds
          const correctIds = questionDef.correctOptionIds || [];
          const selectedIds = testAns.selectedOptionIds || [];

          // Simple strict grading: Must match exactly
          const isCorrect = correctIds.length > 0 &&
            correctIds.length === selectedIds.length &&
            correctIds.every(id => selectedIds.includes(id));

          if (isCorrect) {
            score = 1; // 1 point per question
          }
        }
      }

      testAns.score = score;
      totalScore += score;
      return testAns;
    });

    test.answers = gradedAnswers;
    test.totalScore = totalScore;
    test.status = 'completed'; // For now we mark it completed immediately
    test.submittedAt = new Date();

    // Generate simple overall feedback based on score
    const maxScore = testQuestions.length;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    if (percentage >= 80) test.overallFeedback = 'Xuất sắc! Bạn có nền tảng tiếng Anh rất vững chắc.';
    else if (percentage >= 50) test.overallFeedback = 'Khá tốt! Bạn nắm được cơ bản nhưng cần luyện tập thêm để hoàn thiện.';
    else test.overallFeedback = 'Hãy cố gắng hơn! Bạn nên bắt đầu với các khóa học nền tảng để củng cố kiến thức.';

    await test.save();

    return res.status(200).json({
      success: true,
      message: 'Đã nộp bài thành công',
      data: test,
    });
  } catch (error) {
    logger.error(`Error in submitTest: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get details of a specific test
 * @route   GET /api/placement-tests/:id
 * @access  Private
 */
const getTestDetails = async (req, res, next) => {
  try {
    const test = await PlacementTest.findOne({
      _id: req.params.id,
      studentId: req.user._id
    }).populate('questions');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    logger.error(`Error in getTestDetails: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all tests of the logged in user
 * @route   GET /api/placement-tests/my-tests
 * @access  Private
 */
const getMyTests = async (req, res, next) => {
  try {
    const tests = await PlacementTest.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .select('status totalScore startedAt submittedAt timeLimitMinutes');

    return res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    logger.error(`Error in getMyTests: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Grade speaking answers in a placement test using AI
 * @route   POST /api/placement-tests/:id/grade-speaking
 * @access  Private
 */
const gradeSpeakingWithAI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Fetch the placement test
    let test = await PlacementTest.findOne({
      _id: id,
      studentId: userId,
    }).populate('questions');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const azureSpeechService = require('../services/azureSpeechService');
    const { PlacementQuestion } = require('../models');

    // Fetch all questions to identify speaking types easily
    const testQuestions = test.questions;

    let assessedCount = 0;
    for (const ans of test.answers) {
      const questionDef = testQuestions.find(q => q._id.toString() === ans.questionId.toString());
      if (!questionDef || questionDef.questionType !== 'speaking') continue;

      // Grade if audio exists and no assessment yet or failed assessment
      if (ans.audioSubmissionUrl && (!ans.aiAssessment || ans.aiAssessment.pronunciationScore == null || isNaN(ans.aiAssessment.pronunciationScore))) {
        try {
          const aiResult = await azureSpeechService.assessPronunciation(ans.audioSubmissionUrl);
          ans.aiAssessment = aiResult;

          // Basic logic for IELTS/CEFR speaking map - could be customized
          ans.score = aiResult.pronunciationScore > 60 ? 1 : 0;

          assessedCount++;
        } catch (err) {
          logger.error(`AI grading failed for placement answer ${ans.questionId}: ${err.message}`);
        }
      }
    }

    if (assessedCount > 0) {
      // Recalculate total score
      let newTotal = 0;
      for (const ans of test.answers) {
        newTotal += ans.score || 0;
      }
      test.totalScore = newTotal;
      await test.save();
    }

    return res.status(200).json({
      success: true,
      message: `AI grading completed for ${assessedCount} speaking question(s)`,
      data: test
    });

  } catch (error) {
    logger.error(`Error in gradeSpeakingWithAI: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startTest,
  submitTest,
  getTestDetails,
  getMyTests,
  gradeSpeakingWithAI,
};

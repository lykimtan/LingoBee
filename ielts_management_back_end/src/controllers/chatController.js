const { streamText, tool, convertToModelMessages, stepCountIs } = require('ai');
const { z } = require('zod');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const aiTools = require('../services/aiTools');
const PlacementTest = require('../models/PlacementTest');

const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    const systemPrompt = `Bạn là tư vấn viên AI của Trung tâm IELTS LingoBee, tên của bạn là Bee Thân Thiện.
        Nhiệm vụ của bạn là tư vấn khóa học, thông tin giáo viên, và giải đáp thắc mắc cho học viên.
        Hãy luôn lịch sự, nhiệt tình, chuyên nghiệp và sử dụng tiếng Việt tự nhiên. Đơn vị tiền tệ của các khóa học là VNĐ.
        Để có thông tin chính xác về các khóa học hiện tại, BẮT BUỘC phải gọi các tool được cung cấp.
        Nếu học viên yêu cầu tư vấn khóa học phù hợp với trình độ hiện tại của họ, hãy GỌI tool getLatestPlacementTestResult ĐẦU TIÊN để lấy kết quả bài test gần nhất, sau đó dùng searchCourses để tìm khóa học tương ứng trình độ đó (không cần quan tâm đến kỹ năng của khóa học). Nếu người dùng chưa làm bài test thì hãy yêu cầu người dùng làm bài test nhé
        Nếu học viên hỏi về các khóa học dựa trên trình độ/kỹ năng cụ thể, hãy dùng tool searchCourses hoặc getCourseDetails.
        Nếu học viên hỏi thông tin chung, lộ trình phức tạp, đánh giá giảng viên, hoặc bạn không tìm thấy bằng searchCourses, hãy dùng tool searchKnowledgeBase để tìm kiếm bằng Vector Search.
        Tuyệt đối không được tự bịa ra tên khóa học, giá tiền hay thông tin không có thực. Nếu người dùng hỏi ngoài lề (không liên quan đến học tập, khóa học), hãy lịch sự từ chối và hướng họ về chủ đề học IELTS.`;

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    const safeMessages = messages.map(msg => {
      if (msg.toolInvocations) {
        msg.toolInvocations = msg.toolInvocations.filter(t => t.toolName !== 'suggestQuestions');
        if (msg.toolInvocations.length === 0) {
          delete msg.toolInvocations;
        }
      }

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

    const dynamicTools = {
      ...aiTools,
      getLatestPlacementTestResult: tool({
        description: 'Truy xuất kết quả bài kiểm tra năng lực (placement test) gần đây nhất của người dùng hiện tại đang chat. Sử dụng công cụ này KHI VÀ CHỈ KHI người dùng yêu cầu tư vấn khóa học phù hợp với trình độ hiện tại của họ.',
        parameters: z.object({}), // z: zod use for checking schema and validation các tham số đầu vào mà AI tạo ra, để đảm bảo an toàn khi gọi tool 
        execute: async () => {
          try {
            console.log(`\n[Tool Call] AI đang gọi tool: getLatestPlacementTestResult (UserId: ${userId})`);
            if (!userId) {
              return 'Người dùng chưa đăng nhập. Hãy yêu cầu người dùng đăng nhập để xem kết quả kiểm tra năng lực, hoặc tư vấn các khóa học chung thay vì theo kết quả cá nhân.';
            }

            const latestTest = await PlacementTest.findOne({
              studentId: userId,
              status: { $in: ['completed', 'graded'] }
            })
              .sort({ submittedAt: -1 })
              .lean();

            if (!latestTest) {
              return 'Người dùng chưa hoàn thành bài kiểm tra năng lực nào. Hãy khuyên họ làm bài kiểm tra trước trên trang web.';
            }

            return `Kết quả bài kiểm tra gần nhất của người dùng: Điểm số ${latestTest.totalScore}/${latestTest.questions.length || 15}. Dựa vào bảng tham chiếu: 0-3 câu đúng (Pre-A1), 4-5 câu (A1), 6-7 câu (A2), 8-10 câu (B1), 11-12 câu (B2), 13-14 câu (C1), 15 câu (C2). Hãy phân tích kết quả này, thông báo cho người dùng trình độ của họ, và sau đó DÙNG TOOL searchCourses với trình độ (level) tương ứng để gợi ý khóa học phù hợp.`;
          } catch (error) {
            console.error('Error in getLatestPlacementTestResult:', error);
            return 'Lỗi khi lấy thông tin bài kiểm tra từ database.';
          }
        }
      })
    };

    const result = streamText({
      model: googleProvider('gemini-flash-lite-latest'),
      system: systemPrompt,
      messages: modelMessages,
      tools: dynamicTools,
      stopWhen: stepCountIs(5),
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  chatWithAI,
};

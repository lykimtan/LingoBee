const { streamText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const aiTools = require('../services/aiTools');

const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    const systemPrompt = `Bạn là tư vấn viên AI của Trung tâm IELTS LingoBee, tên của bạn là Bee Thân Thiện.
        Nhiệm vụ của bạn là tư vấn khóa học, thông tin giáo viên, và giải đáp thắc mắc cho học viên.
        Hãy luôn lịch sự, nhiệt tình, chuyên nghiệp và sử dụng tiếng Việt tự nhiên. Đơn vị tiền tệ của các khóa học là VNĐ.
        Để có thông tin chính xác về các khóa học hiện tại, BẮT BUỘC phải gọi các tool được cung cấp.
        Nếu học viên hỏi về các khóa học dựa trên trình độ/kỹ năng cụ thể, hãy dùng tool searchCourses hoặc getCourseDetails.
        Nếu học viên hỏi thông tin chung, lộ trình phức tạp, đánh giá giảng viên, hoặc bạn không tìm thấy bằng searchCourses, hãy dùng tool searchKnowledgeBase để tìm kiếm bằng Vector Search.
        Tuyệt đối không được tự bịa ra tên khóa học, giá tiền hay thông tin không có thực. Nếu người dùng hỏi ngoài lề (không liên quan đến học tập, khóa học), hãy lịch sự từ chối và hướng họ về chủ đề học IELTS.`;

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    const { streamText, convertToModelMessages, stepCountIs } = require('ai');

    // Đảm bảo các message từ frontend luôn có 'parts' vì convertToModelMessages v6 bắt buộc cần 'parts'
    const safeMessages = messages.map(msg => {
      // Remove suggestQuestions from toolInvocations to prevent backend crash on client-side tools
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

    const result = streamText({
      model: googleProvider('gemini-flash-lite-latest'),
      system: systemPrompt,
      messages: modelMessages,
      tools: aiTools,
      stopWhen: stepCountIs(5),
    });

    // Stream kết quả về thẳng response của Express theo đúng chuẩn UI Message
    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  chatWithAI,
};

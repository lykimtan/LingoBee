const { tool, embed } = require('ai');
const { z } = require('zod');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const aiTools = {
  searchCourses: tool({
    description: 'Tìm kiếm danh sách khóa học dựa trên cấp độ hoặc kỹ năng (category). Sử dụng khi người dùng muốn biết trung tâm có những khóa học nào phù hợp với họ.',
    parameters: z.object({
      level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().describe('Trình độ của người học hoặc khóa học. A1, A2 là cơ bản/người mới; B1, B2 là trung bình; C1, C2 là nâng cao.'),
      category: z.enum(['speaking', 'listening', 'reading', 'writing', 'full-test', 'grammar', 'vocabulary']).optional().describe('Kỹ năng muốn học.'),
    }),
    execute: async ({ level, category }) => {
      try {
        console.log(`\n[Tool Call] AI đang gọi tool: searchCourses (Level: ${level || 'All'}, Category: ${category || 'All'})`);
        const query = { status: 'published' }; // Chỉ tìm các khóa đã xuất bản
        if (level) query.level = level;
        if (category) query.category = category;

        const courses = await Course.find(query)
          .select('title slug level category priceTiers publicInfo durationInHours teacher')
          .populate('teacher', 'name')
          .limit(5)
          .lean();

        if (!courses || courses.length === 0) {
          return 'Không tìm thấy khóa học nào phù hợp với yêu cầu này.';
        }

        return courses;
      } catch (error) {
        console.error('Error in searchCourses tool:', error);
        return 'Có lỗi xảy ra khi tìm kiếm khóa học.';
      }
    },
  }),

  getCourseDetails: tool({
    description: 'Lấy thông tin chi tiết về một khóa học cụ thể bằng slug, bao gồm học phí (priceTiers), mô tả ngắn gọn và mục tiêu.',
    parameters: z.object({
      slug: z.string().describe('Slug của khóa học (lấy từ kết quả tìm kiếm).'),
    }),
    execute: async ({ slug }) => {
      try {
        const course = await Course.findOne({ slug, status: 'published' })
          .select('title description level category priceTiers publicInfo learningOutcomes totalVideos totalExercises durationInHours teacher')
          .populate('teacher', 'name email avatar')
          .lean();

        if (!course) {
          return 'Không tìm thấy khóa học với slug này.';
        }

        return course;
      } catch (error) {
        console.error('Error in getCourseDetails tool:', error);
        return 'Có lỗi xảy ra khi lấy chi tiết khóa học.';
      }
    },
  }),

  searchKnowledgeBase: tool({
    description: 'Tìm kiếm thông tin chung, lộ trình học, thông tin giáo viên, hoặc tư vấn dựa trên hoàn cảnh phức tạp của học viên bằng Vector Search. Sử dụng công cụ này khi người dùng hỏi các vấn đề chung chung mà công cụ searchCourses không đủ đáp ứng.',
    parameters: z.object({
      query: z.string().describe('Câu hỏi hoặc yêu cầu tìm kiếm chi tiết của người dùng.'),
    }),
    execute: async ({ query }) => {
      try {
        console.log(`\n[Tool Call] AI đang gọi tool: searchKnowledgeBase`);
        console.log(`   └─ Câu hỏi tìm kiếm vector: "${query}"`);

        const { embedding } = await embed({
          model: googleProvider.textEmbeddingModel('gemini-embedding-001'),
          value: query,
        });

        const db = mongoose.connection.db;
        if (!db) {
          return 'Lỗi: Chưa kết nối Database hoặc Mongoose chưa sẵn sàng.';
        }

        const knowledgeCollection = db.collection('knowledge_base');

        const pipeline = [
          {
            $vectorSearch: {
              index: 'default',
              path: 'embedding',
              queryVector: embedding,
              numCandidates: 100,
              limit: 5,
            },
          },
          {
            $project: {
              _id: 0,
              text: 1,
              sourceId: 1,
              type: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ];

        const contextDocuments = await knowledgeCollection.aggregate(pipeline).toArray();

        if (!contextDocuments || contextDocuments.length === 0) {
          return 'Không tìm thấy thông tin nào phù hợp trong cơ sở dữ liệu tri thức.';
        }

        // Trả về text của các tài liệu tìm được để mô hình tham khảo
        return contextDocuments.map(doc => doc.text).join('\n\n---\n\n');
      } catch (error) {
        console.error('Error in searchKnowledgeBase tool:', error);
        return 'Có lỗi xảy ra khi tìm kiếm ngữ nghĩa. Hãy báo với admin kiểm tra Atlas Vector Search Index "default" trên collection "knowledge_base".';
      }
    },
  }),

  searchTeachers: tool({
    description: 'Tìm kiếm và liệt kê danh sách các giảng viên (giáo viên) đang giảng dạy tại trung tâm. Sử dụng công cụ này khi người dùng hỏi về đội ngũ giáo viên, hoặc hỏi đích danh một giáo viên nào đó.',
    parameters: z.object({
      name: z.string().optional().describe('Tên của giảng viên nếu người dùng muốn tìm đích danh một người (ví dụ: "cô Lan", "thầy John"). Để trống nếu muốn xem toàn bộ.'),
    }),
    execute: async ({ name }) => {
      try {
        console.log(`\n[Tool Call] AI đang gọi tool: searchTeachers (Name: ${name || 'All'})`);

        const query = { role: 'teacher', status: 'active' };
        if (name) {
          // Tìm kiếm tương đối không phân biệt hoa thường
          query.name = { $regex: name, $options: 'i' };
        }

        const teachers = await User.find(query)
          .select('name email avatar bio')
          .limit(10)
          .lean();

        if (!teachers || teachers.length === 0) {
          return name
            ? `Không tìm thấy giảng viên nào tên là "${name}".`
            : 'Hiện tại trung tâm chưa có thông tin giảng viên nào.';
        }

        return teachers;
      } catch (error) {
        console.error('Error in searchTeachers tool:', error);
        return 'Có lỗi xảy ra khi lấy thông tin giảng viên.';
      }
    },
  })
};

module.exports = aiTools;

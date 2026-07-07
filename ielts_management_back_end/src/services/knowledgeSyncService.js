const mongoose = require('mongoose');
const { embed } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

/**
 * Lấy đối tượng collection knowledge_base
 */
const getKnowledgeCollection = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return db.collection('knowledge_base');
};

/**
 * Đồng bộ Khóa học vào Vector Database
 */
exports.syncCourse = async (course) => {
  try {
    // Chỉ đồng bộ nếu khóa học đã được public/published
    // Nếu khóa học bị ẩn (archived/draft/review) thì gỡ khỏi Vector DB để AI không tư vấn bậy
    if (course.status !== 'published' && !course.isPublished) {
      return await exports.removeCourse(course._id);
    }

    const collection = getKnowledgeCollection();
    
    // Tạo nội dung tư vấn dựa trên thông tin khóa học
    const priceText = course.priceTiers && course.priceTiers.length > 0 
      ? `Học phí khoảng từ ${course.priceTiers[0].price} VNĐ.` 
      : 'Chưa có thông tin học phí.';
      
    const textContent = `Khóa học ${course.title} (dành cho cấp độ ${course.level}, tập trung kỹ năng ${course.category || 'chung'}). 
Mô tả: ${course.description}
Mục tiêu đầu ra: ${course.learningOutcomes ? course.learningOutcomes.join(', ') : 'Chưa cập nhật'}. 
Thời lượng: ${course.durationInHours || 0} giờ.
${priceText}`;

    // Tạo vector
    const { embedding } = await embed({
      model: googleProvider.textEmbeddingModel('gemini-embedding-001'), // Sử dụng gemini-embedding-001
      value: textContent,
    });

    // Lưu hoặc Cập nhật vào knowledge_base
    await collection.updateOne(
      { sourceId: course._id.toString(), type: 'course_info' },
      {
        $set: {
          type: 'course_info',
          text: textContent,
          embedding: embedding,
          sourceId: course._id.toString(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`[Sync] Đã đồng bộ khóa học ${course.title} vào Knowledge Base.`);
  } catch (error) {
    console.error('[Sync Error] Lỗi đồng bộ khóa học:', error);
  }
};

/**
 * Xóa Khóa học khỏi Vector Database
 */
exports.removeCourse = async (courseId) => {
  try {
    const collection = getKnowledgeCollection();
    await collection.deleteOne({ sourceId: courseId.toString(), type: 'course_info' });
    console.log(`[Sync] Đã xóa khóa học ${courseId} khỏi Knowledge Base.`);
  } catch (error) {
    console.error('[Sync Error] Lỗi xóa khóa học:', error);
  }
};

/**
 * Đồng bộ Giáo viên vào Vector Database
 */
exports.syncTeacher = async (user) => {
  try {
    // Chỉ đồng bộ nếu role là teacher
    if (user.role !== 'teacher') {
      return await exports.removeTeacher(user._id);
    }

    const collection = getKnowledgeCollection();
    
    // Fetch teacher profile if exists
    let profileText = '';
    try {
      const TeacherProfile = require('../models/TeacherProfile');
      const profile = await TeacherProfile.findOne({ userId: user._id });
      if (profile) {
        profileText = `\nChức danh: ${profile.title || 'Giảng viên IELTS'}. Trình độ IELTS Overall: Band ${profile.band || '8.0'}. Số năm kinh nghiệm: ${profile.experienceYears || 0} năm.
Giới thiệu: ${profile.bio || ''}
Triết lý giảng dạy: ${profile.teachingPhilosophy || ''}
Điểm nổi bật: ${profile.highlights ? profile.highlights.join('; ') : ''}
Bằng cấp & Chứng chỉ: ${profile.certificates ? profile.certificates.join('; ') : ''}`;
      }
    } catch (err) {
      console.warn('[Sync Warning] Không tải được TeacherProfile để đồng bộ:', err.message);
    }

    const textContent = `Giảng viên ${user.name} (Email: ${user.email}). Đây là một giảng viên của trung tâm IELTS LingoBee.${profileText}`;

    const { embedding } = await embed({
      model: googleProvider.textEmbeddingModel('gemini-embedding-001'),
      value: textContent,
    });

    await collection.updateOne(
      { sourceId: user._id.toString(), type: 'educator_info' },
      {
        $set: {
          type: 'educator_info',
          text: textContent,
          embedding: embedding,
          sourceId: user._id.toString(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`[Sync] Đã đồng bộ giảng viên ${user.name} vào Knowledge Base.`);
  } catch (error) {
    console.error('[Sync Error] Lỗi đồng bộ giảng viên:', error);
  }
};

/**
 * Xóa Giáo viên khỏi Vector Database
 */
exports.removeTeacher = async (userId) => {
  try {
    const collection = getKnowledgeCollection();
    await collection.deleteOne({ sourceId: userId.toString(), type: 'educator_info' });
    console.log(`[Sync] Đã xóa giảng viên ${userId} khỏi Knowledge Base.`);
  } catch (error) {
    console.error('[Sync Error] Lỗi xóa giảng viên:', error);
  }
};

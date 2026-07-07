const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'Giảng viên IELTS LingoBee',
      trim: true,
    },
    band: {
      type: String,
      default: '8.0',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 3,
      min: 0,
    },
    bio: {
      type: String,
      default: 'Chuyên gia luyện thi IELTS với nhiều năm kinh nghiệm giảng dạy và đồng hành cùng học viên chinh phục mục tiêu điểm số.',
    },
    teachingPhilosophy: {
      type: String,
      default: 'Tập trung vào tư duy phản biện, phương pháp học thực chất và ứng dụng thực tế trong công việc cùng cuộc sống.',
    },
    highlights: {
      type: [String],
      default: [
        'Bài giảng mô hình hiện đại, tập trung ứng dụng',
        'Cam kết đầu ra rõ ràng theo lộ trình cá nhân hóa',
        'Theo sát tiến độ qua bản đồ năng lực chuyên sâu',
      ],
    },
    certificates: {
      type: [String],
      default: ['IELTS Academic Band 8.0+', 'TESOL / CELTA Certified'],
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teacherProfileSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);

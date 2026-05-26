const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // Người tạo ra feedback này
        },
        message: {
            type: String,
            required: true,
        },

        // --- CÁC TRƯỜNG THÊM MỚI ĐỂ QUẢN LÝ TRẠNG THÁI DUYỆT ---

        isResolved: {
            type: Boolean,
            default: false, // Đánh dấu true khi Admin xác nhận giáo viên đã sửa đúng
        },
        resolvedAt: {
            type: Date,
            default: null, // Lưu lại thời gian chính xác lúc Admin bấm nút "Xác nhận đã sửa"
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // (Tùy chọn) Lưu ID của Admin đã duyệt, rất hữu ích nếu hệ thống có nhiều Admin
        },

        // Nâng cấp enum của status để mô tả đúng vòng đời (lifecycle) của feedback
        status: {
            type: String,
            enum: [
                'pending_fix',     // Admin vừa gửi, chờ giáo viên sửa
                'teacher_updated', // Giáo viên báo cáo là đã sửa xong, chờ Admin check lại
                'resolved',        // Admin đã check và đánh dấu hoàn thành
                'ignored'          // Feedback bị bỏ qua (ví dụ: Admin quyết định không cần sửa nữa)
            ],
            default: 'pending_fix',
        }
    },
    {
        timestamps: true, // Tự động quản lý createdAt và updatedAt
    }
);

// Index để truy vấn nhanh feedback theo video
feedbackSchema.index({ videoId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
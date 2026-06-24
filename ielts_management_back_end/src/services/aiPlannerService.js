const { generateObject } = require('ai');
const { z } = require('zod');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const Course = require('../models/Course');
const Video = require('../models/Video');

const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// AI Output Schema
const scheduleSchema = z.object({
    dailySchedule: z.array(z.object({
        day: z.number().describe('Ngày thứ mấy trong lộ trình (VD: 1, 2, 3...)'),
        date: z.string().describe('Ngày học cụ thể (YYYY-MM-DD)'),
        lessons: z.array(z.object({
            videoId: z.string().describe('ID của video bài giảng'),
            order: z.number().describe('Thứ tự học trong ngày')
        }))
    }))
});

/**
 * Hàm sinh lộ trình học tập sử dụng Gemini
 */
const generateLearningPath = async (courseId, targetDate, availableDays, hoursPerDay) => {
    // 1. Fetch Course & Videos
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Không tìm thấy khóa học');

    const videos = await Video.find({ courseId: course._id, isPublished: true }).sort({ order: 1 }).lean();
    if (!videos || videos.length === 0) {
        throw new Error('Khóa học này chưa có bài giảng nào được xuất bản.');
    }

    // 2. Validate thời lượng (Basic logic)
    const totalDurationSeconds = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
    const totalDurationHours = totalDurationSeconds / 3600;

    // Tính số ngày rảnh từ nay đến targetDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    if (end <= today) {
        throw new Error('Ngày mục tiêu phải lớn hơn ngày hiện tại.');
    }

    let availableDaysCount = 0;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Bắt đầu từ ngày mai
    const startDateForPrompt = new Date(currentDate);

    while (currentDate <= end) {
        if (availableDays.includes(currentDate.getDay())) {
            availableDaysCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalAvailableHours = availableDaysCount * hoursPerDay;

    if (totalAvailableHours < totalDurationHours) {
        throw new Error(`Thời gian rảnh dự kiến (${totalAvailableHours} giờ) không đủ để hoàn thành khóa học (${Math.ceil(totalDurationHours)} giờ). Vui lòng nới lỏng mục tiêu hoặc tăng thời gian rảnh.`);
    }

    if (videos.length > availableDaysCount * 2) {
        throw new Error(`Bạn chỉ có ${availableDaysCount} ngày rảnh. Với quy tắc tối đa 2 video/ngày, bạn chỉ học được tối đa ${availableDaysCount * 2} video, nhưng khoá học có ${videos.length} video. Vui lòng nới lỏng mục tiêu.`);
    }

    // 3. Chuẩn bị prompt cho AI
    const promptData = {
        courseName: course.title,
        startDate: startDateForPrompt.toISOString().split('T')[0],
        targetDate: end.toISOString().split('T')[0],
        availableDays: availableDays,
        hoursPerDay: hoursPerDay,
        totalVideos: videos.length,
        videos: videos.map(v => {
            const videoDurationMins = Math.ceil((v.duration || 1800) / 60); // Default 30 mins if missing
            return {
                id: v._id.toString(),
                title: v.title,
                durationMinutes: videoDurationMins + 15 // Add 15 mins buffer for exercises
            };
        })
    };

    const systemPrompt = `Bạn là một trợ lý AI thiết kế lộ trình học tập. 
HÃY LÀM THEO CÁC QUY TẮC BẮT BUỘC SAU ĐÂY MỘT CÁCH TUYỆT ĐỐI:
1. TRONG TRƯỜNG HỢP NGƯỜI DÙNG ĐẶT MỐC THỜI GIAN HOÀN THÀNH MỤC TIÊU QUÁ XA NGÀY HIỆN TẠI THÌ MỖI NGÀY TỐI ĐA 2 VIDEO: Tuyệt đối không được xếp quá 2 video bài giảng vào cùng một ngày (mảng 'lessons' của mỗi ngày có tối đa 2 phần tử). Nếu ngày hiện tại đã xếp đủ 2 video, BẮT BUỘC chuyển sang ngày rảnh tiếp theo.
2. CHỈ HỌC VÀO NGÀY RẢNH: Chỉ xếp lịch vào các ngày trong tuần được cung cấp (availableDays: 0=Sun, 1=Mon...).
3. KHÔNG BỎ SÓT: Bắt buộc phải lên lịch cho TẤT CẢ ${promptData.totalVideos} video trong danh sách. Không được tự ý cắt xén hay gộp video.
4. THỨ TỰ: Giữ đúng thứ tự video từ đầu đến cuối.
5. THỜI GIAN: Bắt đầu từ ${promptData.startDate} và kết thúc trước ${promptData.targetDate}.
Trả về định dạng JSON với mảng 'dailySchedule'.
`;

    // 4. Gọi Vercel AI SDK (generateObject)
    const result = await generateObject({
        model: googleProvider('gemini-flash-lite-latest'), // Using flash for better reasoning than lite
        schema: scheduleSchema,
        system: systemPrompt,
        prompt: `Dữ liệu khóa học: ${JSON.stringify(promptData)}`
    });

    return result.object; // { dailySchedule: [...] }
};

module.exports = {
    generateLearningPath
};

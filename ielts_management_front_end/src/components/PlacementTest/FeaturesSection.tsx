import React from 'react';
import { Timer, CheckCircle2, Book, Asterisk } from 'lucide-react';
import Image from 'next/image';

export default function FeaturesSection() {
    const features = [
        {
            id: 1,
            title: 'Sử dụng công nghệ kiểm tra đa giai đoạn',
            description: 'Công nghệ kiểm tra đa giai đoạn (Multistage Testing) đang được các kỳ thi chuẩn hóa quốc tế như Digital SAT và GRE áp dụng.',
            // Thay đổi đường dẫn src thành đường dẫn ảnh thực tế của bạn
            icon: <Image src="/placementTest/Clock_loop.gif" alt="Multistage Testing" width={80} height={80} className="object-contain" />,
        },
        {
            id: 2,
            title: 'Tích hợp AI chấm Speaking',
            description: 'Đánh giá phát âm, ngữ điệu và độ trôi chảy ngay lập tức mà không cần đợi giáo viên chấm.',
            // Thay đổi đường dẫn src thành đường dẫn ảnh thực tế của bạn
            icon: <Image src="/placementTest/AI.gif" alt="AI Speaking" width={40} height={40} unoptimized className="object-contain" />,
        },
        {
            id: 3,
            title: 'Kho câu hỏi đồ sộ',
            description: 'Đưa ra kết quả đầu ra chuẩn nhất với người dùng nhờ kho câu hỏi đồ sộ',
            // Thay đổi đường dẫn src thành đường dẫn ảnh thực tế của bạn
            icon: <Image src="/placementTest/question.gif" alt="Question Bank" width={40} height={40} className="object-contain" />,
        },
    ];

    return (
        <section className="flex justify-center font-sans">
            <div className="w-full bg-[#EBF4FF]/70 backdrop-blur-md border border-white/60 shadow-sm  p-6 md:p-10 flex flex-col md:flex-row gap-8">

                <Image src="/FeatureSection.webp" alt="Placement Test Features" width={500} height={500} loading="eager" />

                <div className="md:w-1/2 bg-white rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="flex flex-col h-full justify-between space-y-6">

                        {features.map((feature, index) => (
                            <React.Fragment key={feature.id}>
                                <div className="flex items-start justify-between gap-6 group">

                                    {/* Nội dung text */}
                                    <div className="flex-1">
                                        {/* Icon ngôi sao nhỏ trên tiêu đề */}
                                        <Asterisk className="w-5 h-5 text-blue-600 mb-2" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 text-[0.95rem] leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Icon minh họa bên phải */}
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {/* Chỗ này bạn có thể thay bằng <img> chứa icon 3D giống trong thiết kế */}
                                        {feature.icon}
                                    </div>

                                </div>

                                {/* Đường gạch ngang phân cách (trừ phần tử cuối cùng) */}
                                {index < features.length - 1 && (
                                    <hr className="border-gray-100" />
                                )}
                            </React.Fragment>
                        ))}

                    </div>
                </div>

            </div>
        </section>
    );
}
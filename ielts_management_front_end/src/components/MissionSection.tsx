import React from 'react';

export const MissionSection = () => {
  return (
    <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
      {/* Background Image & Dark Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/homepage/mission.avif')" }}
      ></div>
      <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Text Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-wide drop-shadow-lg">
          Sứ mệnh của LingoBee
        </h2>

        <div className="space-y-6 text-sm md:text-base lg:text-lg text-gray-200 leading-relaxed font-light">
          <p>
            Sứ mệnh của LingoBee là tạo ra một hệ sinh thái học tập và quản lý tiếng Anh toàn diện, hiệu quả và tiết kiệm thời gian, từ đó nâng cao tư duy logic và kỹ năng giải quyết vấn đề cho học viên. Chúng tôi không chỉ hướng tới việc giúp học viên đạt mục tiêu IELTS, mà còn trang bị công cụ để các trung tâm tối ưu hóa quy trình giảng dạy.
          </p>
          <p>
            LingoBee truyền cảm hứng về "tinh thần tạo giá trị", khích lệ sự đổi mới, sáng tạo, ứng dụng công nghệ hiện đại vào giáo dục. Chúng tôi khát vọng đưa nền tảng quản lý và phương pháp học tiếng Anh của người Việt lan tỏa mạnh mẽ, đem lại giá trị thiết thực cho cộng đồng.
          </p>
          <p>
            Trong tương lai, chúng tôi sẽ định hình tiêu chuẩn công nghệ mới cho thị trường giáo dục tiếng Anh ở mọi cấp độ và quy mô.
          </p>
        </div>
      </div>
    </section>
  );
};

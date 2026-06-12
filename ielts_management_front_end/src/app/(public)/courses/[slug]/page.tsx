import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { courseService } from "@/services/courseService";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle2, Clock, Book, Target, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { CoursePreviewVideo } from "@/components/public/courses/CoursePreviewVideo";
import { createSafeHtml } from '@/utils/utils';
import { TeacherShowcase } from "@/components/TeacherShowcase";
import { EnrollButton } from "@/components/public/courses/EnrollButton";
import { CourseReviewsList } from "@/components/public/courses/CourseReviewsList";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentTab = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'overview';

  let course = null;

  try {
    const res = await courseService.getPublicCourseBySlug(slug);
    if (res.data) {
      course = res.data as any; // Using any for simplicity with populated fields
    }
  } catch (error) {
    console.error("Failed to fetch course details:", error);
  }

  if (!course) {
    notFound();
  }

  // Format data
  const teacherName = course.teacher?.name || `${course.teacher?.firstName || ''} ${course.teacher?.lastName || ''}`.trim() || "Unknown Teacher";
  const thumbnail = course.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp";
  const rating = course.averageRating || 4.5;
  const reviews = course.totalReviews || 120;
  const originalPrice = course.priceTiers?.[0]?.price || 5000000;

  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-24" />

      {/* Breadcrumbs & Tabs */}
      <div className="bg-transparent border-b border-white/10 pt-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-gray-400 font-medium mb-6">
            <Link href="/" className="hover:text-[#1c7c78] transition-colors">Trang Chủ</Link>
            <span className="mx-2">/</span>
            <Link href="/courses" className="hover:text-[#1c7c78] transition-colors">Khóa học</Link>
            <span className="mx-2">/</span>
            <span className="uppercase">{course.category || "General"}</span>
            <span className="mx-2">/</span>
            <span className="text-white font-semibold">{course.title}</span>
          </div>

          <div className="flex items-center gap-8 text-base font-medium">
            <Link
              href={`/courses/${slug}?tab=overview`}
              className={`pb-4 border-b-2 transition-colors ${currentTab === 'overview' ? 'border-[#1c7c78] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Tổng quan khóa học
            </Link>
            <Link
              href={`/courses/${slug}?tab=teacher`}
              className={`pb-4 border-b-2 transition-colors ${currentTab === 'teacher' ? 'border-[#1c7c78] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Hồ sơ giáo viên
            </Link>
          </div>
        </div>
      </div>

      {currentTab === 'teacher' ? (
        <div className="relative z-10 bg-[#efece6]">
          <TeacherShowcase />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* LEFT COLUMN - Main Content */}
            <div className="flex-1 lg:max-w-[65%]">

              {/* Header Info */}
              <div className="mb-10 relative z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 uppercase">
                  {course.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-300">({rating})</span>
                  <span className="text-gray-400 underline text-sm ml-2">{reviews} đánh giá</span>
                </div>

                <div
                  className="text-lg text-gray-300 mb-6 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={createSafeHtml(
                    course.publicInfo?.shortDescription ||
                    course.description ||
                    "Khóa học chất lượng cao giúp bạn xây dựng nền tảng vững chắc và bứt phá điểm số nhanh chóng."
                  )}
                />



                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">Giáo viên:</span>
                    <span className="font-bold text-[#1c7c78]">{teacherName}</span>
                  </div>
                  {course.teachingAssistants && course.teachingAssistants.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Trợ giảng:</span>
                      <span className="font-bold text-[#1c7c78]">
                        {course.teachingAssistants.map((ta: any) => ta.name).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Cập nhật {new Date(course.updatedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.totalStudents || 3384} học viên đã học</span>
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mb-12 relative z-10">
                <h2 className="text-2xl font-bold text-white mb-6">Bạn sẽ đạt được gì sau khóa học</h2>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.learningOutcomes?.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-[#1c7c78] shrink-0 mt-0.5" />
                        <span className="text-gray-300 leading-relaxed">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Video */}
              <div className="mb-12 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Video xem thử khóa học</h2>
                </div>
                <CoursePreviewVideo previewVideoUrl={course.promoVideoUrl || course.videoUrl} />
              </div>

              {/* Course Reviews */}
              <div className="mb-12 relative z-10">
                <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ học viên</h2>
                <CourseReviewsList courseId={course._id} />
              </div>

            </div>

            {/* RIGHT COLUMN - Sticky Sidebar */}
            <div className="w-full lg:w-[35%] relative z-10">
              <div className="sticky top-28 bg-[#0c1824]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden liquid-glass">

                {/* Promo Thumbnail */}
                <div className="relative aspect-video w-full bg-black/50 group cursor-pointer">
                  <Image
                    src={thumbnail}
                    alt="Thumbnail"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Pricing & CTA */}
                <div className="p-6">
                  <EnrollButton courseId={course._id} price={originalPrice} slug={slug} />

                  {/* Features List */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h4 className="font-bold text-white mb-4">Khóa học này bao gồm:</h4>
                    <div
                      className="text-base text-gray-300 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={createSafeHtml(
                        course.courseDetail
                      )}
                    />
                  </div>

                </div>
              </div>

              {/* Floating Badges outside the card (simulating the right floating elements) */}
              <div className="hidden xl:flex flex-col gap-3 absolute -right-[4.5rem] top-1/4">
                <div className="bg-[#1c7c78] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap -rotate-2">
                  Điểm & Review
                </div>
                <div className="bg-[#ef4444] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap rotate-1">
                  Phương pháp chuẩn
                </div>
                <div className="bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap -rotate-1">
                  Sách độc quyền
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

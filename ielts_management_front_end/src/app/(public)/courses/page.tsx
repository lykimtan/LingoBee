import { Navigation } from "@/components/Navigation";
import { CourseHeroSection } from "@/components/public/courses/CourseHeroSection";
import { CourseProblemsSection } from "@/components/public/courses/CourseProblemsSection";
import { CourseSolutionsSection } from "@/components/public/courses/CourseSolutionsSection";
import { CourseSliderSection, SliderCourse } from "@/components/public/courses/CourseSliderSection";
import { Footer } from "@/components/Footer";
import { courseService } from "@/services/courseService";
import Image from 'next/image';



export default async function CoursesPage() {
    let sliderCourses: SliderCourse[] = [];

    try {
        const res = await courseService.getPublicCourses();
        if (res.data) {
            // Dữ liệu trả về từ getPublicCourses đã được filter status published ở backend
            sliderCourses = res.data.map(c => ({
                id: c._id,
                title: c.title,
                subtitle: c.description || "Khóa học chất lượng cao",
                tags: [c.category || "General", c.level || "Beginner"].filter(Boolean),
                slug: c.slug || c._id,
                thumbnail: c.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp",
                teacher: c.teacher?.name || "Unknown Teacher",
                avatarTeacher: c.teacher?.avatar || "/CoursesPage/avatarTeacher.webp"
            }));
        }
    } catch (e) {
        console.error("Failed to fetch public courses:", e);
    }

    return (
        <div className="relative w-full overflow-hidden min-h-screen">
            <Navigation />

            {/* Spacer to push content down below fixed navigation */}
            <div className="h-16 lg:h-24" />

            {/* Hero Section */}
            <CourseHeroSection />

            {/* Problems Section */}
            <CourseProblemsSection />

            {/* Arrow Divider */}
            <div className="relative z-50 w-full flex justify-center -my-8 md:-my-12 pointer-events-none">
                <div className=" flex items-center justify-center overflow-hidden  bg-white/5 ">
                    <Image unoptimized src="/CoursesPage/ArrowDown.gif" alt="ArrowDown" width={70} height={70} className="w-auto" />
                </div>
            </div>

            {/* Solutions Section */}
            <CourseSolutionsSection />

            {/* Course Listing */}
            <CourseSliderSection courses={sliderCourses} />

            <Footer />
        </div>
    );
}

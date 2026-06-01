"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Globe, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SliderCourse {
    id: string;
    title: string;
    subtitle: string;
    tags: string[];
    slug: string;
    thumbnail: string;
    teacher: string;
    avatarTeacher: string;
}

interface CourseSliderSectionProps {
    courses: SliderCourse[];
}

export const CourseSliderSection = ({ courses }: CourseSliderSectionProps) => {
    const [currentIndex, setCurrentIndex] = useState(Math.floor((courses?.length || 0) / 2));
    const router = useRouter();

    if (!courses || courses.length === 0) {
        return null;
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % courses.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
    };

    const handleCourseClick = (slug: string) => {
        router.push(`/courses/${slug}`);
    };

    return (
        <section id="course-slider-section" className="w-full py-24 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
                        Hệ thống khóa học toàn diện của chúng tôi
                    </h2>
                </div>

                {/* Slider Container */}
                <div className="relative h-[500px] w-full flex items-center justify-center">
                    {courses.map((course, index) => {
                        let offset = (index - currentIndex + courses.length) % courses.length;
                        if (offset > Math.floor(courses.length / 2)) {
                            offset -= courses.length;
                        }

                        let positionClass = "opacity-0 scale-50 z-0 pointer-events-none"; // Hidden by default
                        let isCenter = offset === 0;

                        if (offset === 0) {
                            positionClass = "opacity-100 scale-100 z-30 translate-x-0";
                        } else if (offset === 1) {
                            positionClass = "opacity-60 scale-75 z-20 translate-x-[90%] md:translate-x-[130%] cursor-pointer";
                        } else if (offset === -1) {
                            positionClass = "opacity-60 scale-75 z-20 -translate-x-[90%] md:-translate-x-[130%] cursor-pointer";
                        } else if (offset === 2) {
                            positionClass = "opacity-30 scale-50 z-10 translate-x-[160%] md:translate-x-[250%] cursor-pointer hidden md:flex";
                        } else if (offset === -2) {
                            positionClass = "opacity-30 scale-50 z-10 -translate-x-[160%] md:-translate-x-[250%] cursor-pointer hidden md:flex";
                        }

                        const icons = [BookOpen, Globe, Briefcase];
                        const gradients = [
                            "from-blue-500 to-indigo-700",
                            "from-indigo-400 to-purple-600",
                            "from-blue-300 to-blue-500",
                            "from-emerald-400 to-teal-600",
                            "from-rose-400 to-orange-500"
                        ];

                        const Icon = icons[index % icons.length];
                        const gradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={course.id}
                                onClick={() => {
                                    if (offset !== 0) {
                                        setCurrentIndex((prev) => (prev + offset + courses.length) % courses.length);
                                    }
                                }}
                                className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center ${positionClass}`}
                            >
                                {/* Circle Image/Icon Placeholder */}
                                <div
                                    className={`relative rounded-full overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center bg-gray-200 
                                             ${isCenter ? 'w-64 h-64 md:w-80 md:h-80 border-4 border-white/20 ring-8 ring-blue-500/20' : 'w-48 h-48 md:w-56 md:h-56 border-2 border-white/50'}`}
                                >
                                    <img
                                        src={course.thumbnail} /* Thay course.thumbnail bằng biến chứa URL ảnh thực tế của bạn */
                                        alt={course.title || "Course thumbnail"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className={`mt-8 text-center transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-40'}`}>
                                    <h3 className={`font-bold text-white uppercase ${isCenter ? 'text-2xl md:text-3xl mb-2' : 'text-lg md:text-xl'}`}>
                                        {course.title}
                                    </h3>
                                    {isCenter && (
                                        <div className="flex items-center justify-center gap-3 mb-6 mt-3">
                                            <span className="text-gray-300 font-medium text-sm md:text-base">
                                                Giáo viên đứng lớp:
                                            </span>

                                            <img
                                                src={course.avatarTeacher}
                                                alt={course.teacher}
                                                className="w-8 h-8 rounded-full object-cover border border-white/20"
                                            />
                                            <span className="text-gray-300 font-medium text-sm md:text-base">
                                                {course.teacher}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {course.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className={`rounded-full font-medium ${isCenter
                                                    ? 'bg-blue-500/20 text-blue-300 px-4 py-2 text-sm border border-blue-500/30'
                                                    : 'bg-white/10 text-gray-400 px-3 py-1 text-xs border border-white/10'
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action Button - Only show on center */}
                                    {isCenter && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCourseClick(course.slug);
                                            }}
                                            className="mt-8 px-8 py-3 bg-blue-600 border border-transparent text-white font-semibold rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all flex items-center gap-2 mx-auto group"
                                        >
                                            Chọn khoá học
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-6 mt-12">
                    <button
                        onClick={handlePrev}
                        className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
                        aria-label="Previous course"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
                        aria-label="Next course"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
};

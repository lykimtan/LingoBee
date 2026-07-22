"use client";

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Layers, Award, Star, Users, Video, ChevronRight, X, LayoutGrid, ListFilter, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSafeHtml } from '@/utils/utils';
import { AdminCourseItem } from '@/types';
import Image from 'next/image';

interface CourseListSectionProps {
    courses: AdminCourseItem[];
}

export const CourseListSection: React.FC<CourseListSectionProps> = ({ courses = [] }) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState<'all' | 'level' | 'skill'>('all');
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const [selectedSkill, setSelectedSkill] = useState<string>("all");
    const [groupBy, setGroupBy] = useState<'none' | 'level' | 'skill'>('none');

    // Extract unique levels and skills dynamically
    const availableLevels = useMemo(() => {
        const levels = new Set<string>();
        courses.forEach(c => {
            if (c.level) levels.add(c.level);
        });
        return Array.from(levels);
    }, [courses]);

    const availableSkills = useMemo(() => {
        const skills = new Set<string>();
        courses.forEach(c => {
            if (c.category) skills.add(c.category);
        });
        return Array.from(skills);
    }, [courses]);

    // Filter courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Search match
            const matchesSearch = searchQuery === "" ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (course.teacher?.name && course.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // Level match
            const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;

            // Skill match
            const matchesSkill = selectedSkill === "all" || course.category === selectedSkill;

            return matchesSearch && matchesLevel && matchesSkill;
        });
    }, [courses, searchQuery, selectedLevel, selectedSkill]);

    // Group courses if requested
    const groupedCourses = useMemo(() => {
        if (groupBy === 'none') {
            return { "Tất cả khóa học": filteredCourses };
        }
        if (groupBy === 'level') {
            const groups: Record<string, AdminCourseItem[]> = {};
            filteredCourses.forEach(c => {
                const key = c.level || "Trình độ chung / Chưa xác định";
                if (!groups[key]) groups[key] = [];
                groups[key].push(c);
            });
            return groups;
        }
        if (groupBy === 'skill') {
            const groups: Record<string, AdminCourseItem[]> = {};
            filteredCourses.forEach(c => {
                const key = c.category || "Kỹ năng tổng hợp / General";
                if (!groups[key]) groups[key] = [];
                groups[key].push(c);
            });
            return groups;
        }
        return { "Tất cả khóa học": filteredCourses };
    }, [filteredCourses, groupBy]);

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedLevel("all");
        setSelectedSkill("all");
        setFilterTab("all");
        setGroupBy("none");
    };

    return (
        <section id="course-list-section" className="w-full py-20 bg-transparent relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Title & Description */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        <span>Khám phá & lựa chọn khóa học</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        DANH SÁCH KHÓA HỌC IELTS
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-gray-400">
                        Tìm kiếm, chọn lọc theo trình độ hoặc từng kỹ năng Nghe - Nói - Đọc - Viết phù hợp với mục tiêu của bạn.
                    </p>
                </div>

                {/* Filter and Search Bar Container */}
                <div className="rounded-3xl bg-[#111726]/80 border border-white/10 backdrop-blur-xl p-6 shadow-2xl mb-12">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                        {/* Search Input Box */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm theo tên khóa học, kỹ năng, hoặc giảng viên..."
                                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Group / Tab Switcher */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 ml-1">
                                <ListFilter className="w-4 h-4 text-blue-400" />
                                Phân nhóm theo:
                            </span>
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                                <button
                                    onClick={() => {
                                        setGroupBy('none');
                                        setFilterTab('all');
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${groupBy === 'none'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => {
                                        setGroupBy('level');
                                        setFilterTab('level');
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${groupBy === 'level'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    Trình độ
                                </button>
                                <button
                                    onClick={() => {
                                        setGroupBy('skill');
                                        setFilterTab('skill');
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${groupBy === 'skill'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Award className="w-3.5 h-3.5" />
                                    Kỹ năng chính
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Filter Pills (Level / Skill selection) */}
                    <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-blue-400" />
                                Lọc chi tiết:
                            </span>

                            {/* Level Pills */}
                            {(filterTab === 'all' || filterTab === 'level') && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedLevel("all")}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedLevel === "all"
                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        Mọi trình độ
                                    </button>
                                    {availableLevels.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedLevel(level === selectedLevel ? "all" : level)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedLevel === level
                                                ? 'bg-blue-500 text-white border-blue-400 shadow-sm shadow-blue-500/30 font-semibold'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Skill Pills */}
                            {(filterTab === 'all' || filterTab === 'skill') && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedSkill("all")}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedSkill === "all"
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        Mọi kỹ năng
                                    </button>
                                    {availableSkills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => setSelectedSkill(skill === selectedSkill ? "all" : skill)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedSkill === skill
                                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/30 font-semibold'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active filters status / Reset button */}
                        {(searchQuery || selectedLevel !== "all" || selectedSkill !== "all" || groupBy !== "none") && (
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Đặt lại bộ lọc ({filteredCourses.length} khóa học)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Course Grid / Grouped Sections */}
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl bg-[#111726]/60 border border-white/10 p-8">
                        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy khóa học nào phù hợp</h3>
                        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                            Thử tìm kiếm với từ khóa khác hoặc xóa các điều kiện lọc trình độ, kỹ năng hiện tại.
                        </p>
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
                        >
                            Xem tất cả khóa học
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedCourses).map(([groupTitle, groupItems]) => {
                            if (groupItems.length === 0) return null;
                            return (
                                <div key={groupTitle} className="space-y-6">
                                    {groupBy !== 'none' && (
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                                                {groupTitle} <span className="text-sm font-normal text-gray-400 ml-2">({groupItems.length} khóa học)</span>
                                            </h3>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {groupItems.map((course) => {
                                            const thumbnailSrc = course.publicInfo?.thumbnail || "/CoursesPage/thumbnailCourse.webp";
                                            const teacherName = course.teacher?.name || "IELTS Master Faculty";
                                            const teacherAvatar = course.teacher?.avatar || "/CoursesPage/avatarTeacher.webp";
                                            const rating = course.averageRating ? course.averageRating.toFixed(1) : "Chưa có đánh giá";
                                            const studentCount = course.totalStudents || Math.floor(Math.random() * 50) + 15;
                                            const videoCount = course.totalVideos || Math.floor(Math.random() * 20) + 10;

                                            return (
                                                <div
                                                    key={course._id}
                                                    onClick={() => router.push(`/courses/${course.slug || course._id}`)}
                                                    className="group relative rounded-3xl bg-[#111726]/80 border border-white/10 hover:border-blue-500/50 backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                                                >
                                                    <div>
                                                        {/* Thumbnail Image */}
                                                        <div className="relative h-56 w-full overflow-hidden bg-gray-900">
                                                            <Image
                                                                unoptimized
                                                                src={thumbnailSrc}
                                                                alt={course.title}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111726] via-transparent to-black/30 opacity-80" />

                                                            {/* Badges on Thumbnail */}
                                                            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                                                                {course.category && (
                                                                    <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-md">

                                                                        {course.category}
                                                                    </span>
                                                                )}
                                                                {course.level && (
                                                                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-gray-200 text-xs font-medium">
                                                                        {course.level}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Rating badge */}
                                                            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-bold">
                                                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                                <span>{rating}</span>
                                                            </div>
                                                        </div>

                                                        {/* Course Content */}
                                                        <div className="p-6">
                                                            <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                                                {course.title}
                                                            </h4>
                                                            <div className="mt-2.5 text-xs text-gray-400 line-clamp-2 leading-relaxed"
                                                                dangerouslySetInnerHTML={createSafeHtml(
                                                                    course.description ||
                                                                    "Khóa học chất lượng cao giúp bạn xây dựng nền tảng vững chắc và bứt phá điểm số nhanh chóng."
                                                                )}
                                                            >
                                                            </div>

                                                            {/* Course Stats */}
                                                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Video className="w-4 h-4 text-blue-400" />
                                                                    <span>{videoCount} bài giảng</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Users className="w-4 h-4 text-indigo-400" />
                                                                    <span>{studentCount} học viên</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Footer / Teacher & Action */}
                                                    <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-blue-500/20">
                                                                <Image
                                                                    unoptimized
                                                                    src={teacherAvatar}
                                                                    alt={teacherName}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-300 truncate">
                                                                {teacherName}
                                                            </span>
                                                        </div>

                                                        <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                                                            Chi tiết
                                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

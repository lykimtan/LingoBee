import { TopSection } from "@/components/admin/courses/TopSection";
import { CoursesManager } from "@/components/admin/courses/CoursesManager";
import { Suspense } from "react";

export default function AdminCoursesPage() {
    return (
        <div className="flex flex-col h-full">
            <TopSection />
            <Suspense fallback={<div className="p-8 text-white">Đang tải dữ liệu...</div>}>
                <CoursesManager />
            </Suspense>
        </div>
    )
}
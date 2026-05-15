import { TopSection } from "@/components/admin/courses/TopSection";
import { CoursesManager } from "@/components/admin/courses/CoursesManager";

export default function AdminCoursesPage() {
    return (
        <div className="flex flex-col h-full">
            <TopSection />
            <CoursesManager />
        </div>
    )
}
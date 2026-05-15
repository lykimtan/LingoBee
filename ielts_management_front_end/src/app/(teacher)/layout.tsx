import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import type { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f5ff] to-[#e6f0ff] text-gray-900 font-sans selection:bg-[#ffb800]/30 selection:text-gray-900">
            <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col ">
                <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.5rem] bg-white/40 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl border border-white/60">
                    <TeacherHeader />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8" data-teacher-scroll>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

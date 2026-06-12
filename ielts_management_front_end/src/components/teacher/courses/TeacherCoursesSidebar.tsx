"use client";

import { BookOpen, Mail, Layers, ChevronLeft, ChevronRight, Users } from "lucide-react";
import clsx from "clsx";

export type TeacherCoursesTab = "my-courses" | "invitations" | "assistant-invitations";

interface TeacherCoursesSidebarProps {
  activeTab: TeacherCoursesTab;
  onTabChange: (tab: TeacherCoursesTab) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "my-courses", label: "Khóa học của tôi", icon: BookOpen },
  { id: "invitations", label: "Lời mời từ admin", icon: Mail },
  { id: "assistant-invitations", label: "Lời mời trợ giảng", icon: Users },
] as const;

export function TeacherCoursesSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: TeacherCoursesSidebarProps) {
  return (
    <aside
      className={clsx(
        "flex w-full flex-col gap-3 rounded-2xl border border-white/60 bg-white/50 shadow-sm backdrop-blur-md transition-all",
        isOpen ? "p-4 md:w-64" : "p-2 md:w-14"
      )}
    >
      <div className={clsx("flex items-center", isOpen ? "justify-between" : "justify-center")}>
        {isOpen && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            <Layers className="h-4 w-4" />
            Menu
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Ẩn menu" : "Hiện menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 transition hover:text-gray-900"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      {isOpen &&
        navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#1f6f5e]/10 text-[#1f6f5e] ring-1 ring-[#1f6f5e]/30"
                  : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
    </aside>
  );
}

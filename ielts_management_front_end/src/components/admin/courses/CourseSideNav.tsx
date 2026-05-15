"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PlusCircle, Activity, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export type CourseTab = "list" | "create" | "status" | "settings";

interface CourseSideNavProps {
  activeTab: CourseTab;
  onTabChange?: (tab: CourseTab) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "list", label: "Danh sách khóa học", icon: BookOpen, href: "/admin/courses" },
  { id: "create", label: "Tạo khóa học mới", icon: PlusCircle, href: undefined },
  { id: "status", label: "Quản lý trạng thái", icon: Activity, href: undefined },
  { id: "settings", label: "Cài đặt chung", icon: Settings, href: undefined },
] as const;

export function CourseSideNav({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: CourseSideNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        "flex flex-col gap-2 rounded-2xl bg-white/5 shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all",
        isOpen ? "p-4 md:w-64" : "p-2 md:w-14"
      )}
    >
      <div className={clsx("flex items-center", isOpen ? "justify-between" : "justify-center")}>
        {isOpen && (
          <div className="px-2 text-xs font-semibold uppercase tracking-wider text-white/50">
            Menu Quản Lý
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Ẩn menu" : "Hiện menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:text-white"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      {isOpen &&
        navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const fallbackHref = `/admin/courses?tab=${item.id}`;
          const content = (
            <>
              <Icon
                className={clsx(
                  "h-5 w-5 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
              />
              {item.label}
            </>
          );
          const baseClass = clsx(
            "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
            isActive
              ? "bg-[#ffb800]/10 text-[#ffb800] ring-1 ring-[#ffb800]/30"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          );

          return item.href ? (
            <Link key={item.id} href={item.href} className={baseClass}>
              {content}
            </Link>
          ) : onTabChange ? (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id as CourseTab)}
              className={baseClass}
            >
              {content}
            </button>
          ) : (
            <Link key={item.id} href={fallbackHref} className={baseClass}>
              {content}
            </Link>
          );
        })}
    </nav>
  );
}

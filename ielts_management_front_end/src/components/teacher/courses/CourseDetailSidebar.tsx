"use client";

import { useState } from "react";
import { 
  BookOpen, 
  MessageSquare, 
  CheckSquare, 
  Mail, 
  BarChart2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface CourseDetailSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CourseDetailSidebar({ activeTab, setActiveTab }: CourseDetailSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { id: 'discussions', label: 'Thảo luận', icon: <MessageSquare className="w-5 h-5 shrink-0" /> },
    { id: 'grading', label: 'Chấm điểm', icon: <CheckSquare className="w-5 h-5 shrink-0" /> },
    { id: 'messaging', label: 'Tin nhắn', icon: <Mail className="w-5 h-5 shrink-0" /> },
    { id: 'analytics', label: 'Thống kê', icon: <BarChart2 className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <div 
      className={`shrink-0 flex flex-col gap-2 border-r border-gray-200/50 pr-4 sticky top-6 transition-all duration-300 ${
        isCollapsed ? "w-16 md:w-20" : "w-full md:w-64"
      }`}
    >
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          title={isCollapsed ? tab.label : ""}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all overflow-hidden ${
            activeTab === tab.id
              ? "bg-[#e2ead3] text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
          } ${isCollapsed ? "justify-center px-0" : ""}`}
        >
          {tab.icon}
          {!isCollapsed && <span className="truncate">{tab.label}</span>}
        </button>
      ))}
    </div>
  );
}

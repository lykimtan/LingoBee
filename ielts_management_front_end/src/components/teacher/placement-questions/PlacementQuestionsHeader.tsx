"use client";

import { Plus, Search, Filter, BookOpen } from "lucide-react";

interface PlacementQuestionsHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (type: string, value: string) => void;
  onCreateClick: () => void;
}

export function PlacementQuestionsHeader({
  onSearch,
  onFilterChange,
  onCreateClick,
}: PlacementQuestionsHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Ngân hàng đề thi ĐGNL
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý các câu hỏi dùng cho bài thi thử đầu vào
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              className="appearance-none pl-9 pr-8 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              onChange={(e) => onFilterChange("difficulty", e.target.value)}
            >
              <option value="">Tất cả mức độ</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative group">
            <select
              className="appearance-none pl-9 pr-8 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              onChange={(e) => onFilterChange("questionType", e.target.value)}
            >
              <option value="">Tất cả loại</option>
              <option value="multipleChoice">Trắc nghiệm</option>
              <option value="listeningChoice">Listening</option>
              <option value="speaking">Speaking</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative group">
            <select
              className="appearance-none pl-9 pr-8 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              onChange={(e) => onFilterChange("creator", e.target.value)}
            >
              <option value="">Tất cả người tạo</option>
              <option value="me">Câu hỏi của tôi</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo câu hỏi
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, BookOpen, BarChart2, PieChart as PieIcon, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { PlacementQuestion } from "@/types";
import { placementQuestionService, QuestionPerformanceStats } from "@/services/placementQuestionService";

interface PlacementQuestionsHeaderProps {
  questions?: PlacementQuestion[];
  onSearch: (query: string) => void;
  onFilterChange: (type: string, value: string) => void;
  onCreateClick: () => void;
}

export function PlacementQuestionsHeader({
  questions = [],
  onSearch,
  onFilterChange,
  onCreateClick,
}: PlacementQuestionsHeaderProps) {
  const [showStats, setShowStats] = useState(true);
  const [performanceStats, setPerformanceStats] = useState<QuestionPerformanceStats | null>(null);

  useEffect(() => {
    placementQuestionService
      .getPerformanceStats()
      .then((res) => {
        if (res.status === "success" && res.data) {
          setPerformanceStats(res.data);
        }
      })
      .catch((err) => console.error("Error loading performance stats:", err));
  }, []);

  const stats = useMemo(() => {
    const list = questions || [];
    const total = list.length;
    const activeCount = list.filter((q) => q.isActive).length;
    const inactiveCount = total - activeCount;

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    let mcCount = 0;
    let listeningCount = 0;
    let speakingCount = 0;

    list.forEach((q) => {
      if (q.difficulty === "easy") easyCount++;
      else if (q.difficulty === "medium") mediumCount++;
      else if (q.difficulty === "hard") hardCount++;

      if (q.questionType === "multipleChoice") mcCount++;
      else if (q.questionType === "listeningChoice") listeningCount++;
      else if (q.questionType === "speaking") speakingCount++;
    });

    const difficultyData = [
      { name: "Dễ", count: easyCount, fill: "#22c55e", rate: total ? Math.round((easyCount / total) * 100) : 0 },
      { name: "Trung bình", count: mediumCount, fill: "#eab308", rate: total ? Math.round((mediumCount / total) * 100) : 0 },
      { name: "Khó", count: hardCount, fill: "#ef4444", rate: total ? Math.round((hardCount / total) * 100) : 0 },
    ].filter((item) => item.count > 0);

    const skillData = [
      { name: "Trắc nghiệm / Đọc", count: mcCount, fill: "#6366f1" },
      { name: "Nghe (Listening)", count: listeningCount, fill: "#06b6d4" },
      { name: "Nói (Speaking)", count: speakingCount, fill: "#8b5cf6" },
    ];

    return {
      total,
      activeCount,
      inactiveCount,
      difficultyData,
      skillData,
    };
  }, [questions]);

  return (
    <div className="flex flex-col gap-6 px-6 pb-6 border-b border-gray-100">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Ngân hàng đề thi ĐGNL
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý và thống kê câu hỏi dùng cho bài thi thử đầu vào
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full sm:w-56 pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors text-sm font-semibold whitespace-nowrap shadow-sm cursor-pointer"
            title="Thống kê câu hỏi"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Thống kê</span>
            {showStats ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          <button
            onClick={onCreateClick}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo câu hỏi
          </button>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-2 animate-fade-in">
          {/* Card 1: Tổng quan KPI */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tổng số câu hỏi</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Trong toàn bộ ngân hàng đề thi</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-gray-800">{stats.activeCount}</div>
                  <div className="text-[11px] text-gray-500">Đang hoạt động</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-gray-800">{stats.inactiveCount}</div>
                  <div className="text-[11px] text-gray-500">Tạm ẩn / Nháp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Biểu đồ tròn theo Độ khó */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" /> Tỷ lệ theo độ khó
              </span>
            </div>

            {stats.total === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-gray-400 italic">Chưa có dữ liệu câu hỏi</div>
            ) : (
              <div className="grid grid-cols-2 items-center gap-2 my-1">
                <div className="h-40 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {stats.difficultyData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} câu hỏi`, name]}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5 pr-2">
                  {stats.difficultyData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                        <span className="font-medium text-gray-700 truncate">{item.name}</span>
                      </div>
                      <div className="font-bold text-gray-900 ml-2 shrink-0">
                        {item.count} <span className="text-[10px] text-gray-400 font-normal">({item.rate}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Biểu đồ cột theo Kỹ năng */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" /> Phân bổ theo kỹ năng
              </span>
            </div>

            {stats.total === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-gray-400 italic">Chưa có dữ liệu câu hỏi</div>
            ) : (
              <div className="h-40 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={stats.skillData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip
                      formatter={(val: any) => [`${val} câu hỏi`, "Số lượng"]}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {stats.skillData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Card 4: Hiệu suất làm bài thực tế */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tỷ lệ làm đúng (Thực tế)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Dựa trên lịch sử thi thử của học viên</p>

              <div className="flex flex-col gap-3.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Reading ({performanceStats?.multipleChoice?.totalAttempts || 0} lượt)</span>
                    <span className="text-indigo-600 font-bold">{performanceStats?.multipleChoice?.accuracyRate || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${performanceStats?.multipleChoice?.accuracyRate || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Listening ({performanceStats?.listeningChoice?.totalAttempts || 0} lượt)</span>
                    <span className="text-teal-600 font-bold">{performanceStats?.listeningChoice?.accuracyRate || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${performanceStats?.listeningChoice?.accuracyRate || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Speaking ({performanceStats?.speaking?.totalAttempts || 0} lượt)</span>
                    <span className="text-amber-600 font-bold">ĐTB: {performanceStats?.speaking?.averageScore || 0}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">Điểm trung bình AI chấm trên các bài thi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

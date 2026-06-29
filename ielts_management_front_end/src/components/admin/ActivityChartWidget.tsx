"use client";

import React from "react";
import { ArrowUpRight, Play, Pause, Clock } from "lucide-react";

interface ActivityChartWidgetProps {
  stats?: {
    activityChart: { day: string; value: number; count: number; active?: boolean }[];
    totalEnrollmentsThisWeek: number;
    activeSessions: number;
  };
}

export function ActivityChartWidget({ stats: propStats }: ActivityChartWidgetProps) {
  const defaultStats: NonNullable<ActivityChartWidgetProps["stats"]> = {
    activityChart: [
      { day: "M", value: 8, count: 0 },
      { day: "T", value: 8, count: 0 },
      { day: "W", value: 8, count: 0 },
      { day: "T", value: 8, count: 0 },
      { day: "F", value: 8, count: 0 },
      { day: "S", value: 8, count: 0 },
      { day: "S", value: 8, count: 0 },
    ],
    totalEnrollmentsThisWeek: 0,
    activeSessions: 0,
  };

  const stats = propStats && propStats.activityChart ? propStats : defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Enrollments Chart */}
      <div className="flex flex-col justify-between rounded-[2rem] bg-[#0a1a1c] p-6 shadow-sm border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Số lượt đăng ký khóa học trong tuần</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-light text-white">{stats.totalEnrollmentsThisWeek}</span>
              <span className="mb-1 text-xs text-white/50">Học viên trong tuần</span>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 flex h-32 items-end justify-between px-2 relative">
          {/* Center dashed line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/10"></div>

          {stats.activityChart.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10">
              <div className="relative flex w-2 justify-center">
                {d.active && (
                  <div className="absolute -top-8 rounded-full bg-[#ffb800] px-2 py-1 text-[10px] font-medium text-black whitespace-nowrap">
                    {d.count} Enrolls
                  </div>
                )}
                <div
                  className={`w-2 rounded-full ${d.active ? "bg-[#ffb800]" : "bg-white/20"
                    }`}
                  style={{ height: `${d.value}%` }}
                  title={`${d.count} lượt đăng ký`}
                />
              </div>
              <span className="text-[10px] text-white/40">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#0a1a1c] p-6 shadow-sm border border-white/10">
        <div className="w-full flex items-start justify-between">
          <h3 className="text-lg font-medium text-white">Khóa học đang hoạt động</h3>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 flex h-40 w-40 items-center justify-center">
          {/* Circular dashed border */}
          <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
              strokeDasharray="4 4"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="#ffb800"
              strokeWidth="6"
              strokeDasharray="300 440"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-light text-white">{stats.activeSessions}</div>
            <div className="text-[10px] text-white/50">Đang mở cho học viên</div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Clock, User, BookOpen, GraduationCap, CheckCircle2, Activity, ArrowRight } from "lucide-react";

interface ScheduleWidgetProps {
  activities?: any[];
  loading?: boolean;
}

export function ScheduleWidget({ activities = [], loading = false }: ScheduleWidgetProps) {

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return "Vừa xong";
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-yellow-400" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col rounded-[2rem] bg-[#0a1a1c] p-6 shadow-sm border border-white/10">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hoạt động mới nhất trong ngày</h3>
            <p className="text-xs text-white/50 mt-0.5">Thời gian thực hệ thống</p>
          </div>
        </div>
        <span className="text-xs text-yellow-400 font-semibold px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
          Hôm nay
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/40 text-xs">Đang đồng bộ dòng thời gian...</div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center text-white/40 text-sm">Chưa có sự kiện nào ghi nhận gần đây.</div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {activities.map((act, idx) => (
            <div key={idx} className="relative flex items-start gap-4 group">
              <div className="absolute -left-6 top-4 w-6 flex justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-4 ring-[#0a1a1c] group-hover:scale-125 transition-transform" />
              </div>
              <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 rounded-2xl p-3.5 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {renderIcon(act.type)}
                    <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                      {act.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/40 whitespace-nowrap flex-shrink-0">
                    {getRelativeTime(act.time)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

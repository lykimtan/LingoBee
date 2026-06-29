"use client";

import React, { useState, useEffect } from "react";
import { TopStats } from "@/components/admin/TopStats";
import { ProfileWidget } from "@/components/admin/ProfileWidget";
import { ActivityChartWidget } from "@/components/admin/ActivityChartWidget";
import { NotificationWidget } from "@/components/admin/NotificationWidget";
import { ScheduleWidget } from "@/components/admin/ScheduleWidget";
import { RevenueChartsWidget } from "@/components/admin/RevenueChartsWidget";
import { userService } from "@/services/userService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboardStats().then(res => {
      const payload = (res as any).data || res || {};
      console.log(payload)
      setStats(payload);
    }).catch(err => console.error("Lỗi tải thống kê trang chủ:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full pb-10">
      <TopStats activeStudents={stats?.usersByRole[2].count} totalTeachers={stats?.totalTeachers} ongoingCourses={stats?.ongoingCourses} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr_1fr] mt-2">
        {/* Left Column - Profile */}
        <div className="flex flex-col">
          <ProfileWidget />
        </div>

        {/* Center Column - Charts & Schedule */}
        <div className="flex flex-col gap-6">
          <ActivityChartWidget stats={stats} />

          <RevenueChartsWidget stats={stats} />

          <div className="mt-2">
            <ScheduleWidget activities={stats?.recentActivities} loading={loading} />
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="flex flex-col h-full min-h-[500px]">
          <NotificationWidget />
        </div>
      </div>
    </div>
  );
}

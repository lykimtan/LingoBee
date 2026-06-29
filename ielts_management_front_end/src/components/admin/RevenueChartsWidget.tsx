"use client";

import React from "react";
import { Calendar, TrendingUp, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface RevenueChartsWidgetProps {
  stats?: {
    totalRevenue30Days?: number;
    revenue30DaysChart?: any[];
    revenueWeeklyChart?: any[];
  };
}

export function RevenueChartsWidget({ stats: propStats }: RevenueChartsWidgetProps) {
  const stats = {
    totalRevenue30Days: propStats?.totalRevenue30Days || 0,
    revenue30DaysChart: propStats?.revenue30DaysChart || [],
    revenueWeeklyChart: propStats?.revenueWeeklyChart || [],
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const formatCompactVND = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}tr`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Widget 4: 30 Days Revenue Area Chart */}
      <div className="flex flex-col justify-between rounded-[2rem] bg-[#0a1a1c] p-5 shadow-sm border border-white/10">
        <div>
          <div className="flex items-center justify-between mb-3">
            <button className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/10 transition">
              <span>30 ngày qua</span>
              <Calendar className="h-3 w-3 text-white/50" />
            </button>
          </div>

          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatVND(stats.totalRevenue30Days)}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
              <span className="text-white/50">Doanh thu 30 ngày qua</span>
              <span className="flex items-center text-emerald-400 font-semibold">
                ▲ 100%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenue30DaysChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue30" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                tickLine={false}
                interval={7}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                tickFormatter={formatCompactVND}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(val: any) => [formatVND(val || 0), "Doanh thu"]}
                labelStyle={{ color: '#fff', fontSize: '12px' }}
                contentStyle={{ backgroundColor: '#0f292d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 10px' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue30)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Widget 5: Weekly Revenue Bar Chart */}
      <div className="flex flex-col justify-between rounded-[2rem] bg-[#0a1a1c] p-5 shadow-sm border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Doanh thu tuần</h3>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/10 transition">
            <span>Tuần này</span>
            <Calendar className="h-3 w-3 text-yellow-400" />
          </button>
        </div>

        <div className="mt-8 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueWeeklyChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                tickFormatter={formatCompactVND}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(val: any) => [formatVND(val || 0), "Doanh thu"]}
                labelStyle={{ color: '#fff', fontSize: '12px' }}
                contentStyle={{ backgroundColor: '#0f292d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 10px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 6 }}
              />
              <Bar
                dataKey="amount"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

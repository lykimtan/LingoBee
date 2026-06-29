"use client";

import React, { useState } from 'react';
import { DollarSign, Tag, TrendingUp, ShieldAlert } from 'lucide-react';
import { RevenueStatsTab } from './RevenueStatsTab';
import { DiscountsTab } from './DiscountsTab';

export function PaymentsManager() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'discounts'>('revenue');

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl  p-8 border border-white/10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span>Trung Tâm Tài Chính & Khuyến Mãi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Quản Trị Doanh Thu & Mã Khuyến Mãi
            </h1>
            <p className="text-sm text-white/70 max-w-2xl">
              Theo dõi biến động dòng tiền thanh toán VNPay thực tế, phân tích hiệu suất doanh thu theo từng khóa học và thiết lập các chiến lược mã ưu đãi học phí hấp dẫn.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/10 shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === 'revenue'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-[#0a1a1c] shadow-lg shadow-teal-500/20 scale-[1.02]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Thống kê & Giao dịch</span>
            </button>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === 'discounts'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <Tag className="w-4 h-4" />
              <span>Mã Khuyến Mãi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'revenue' ? <RevenueStatsTab /> : <DiscountsTab />}
      </div>
    </div>
  );
}

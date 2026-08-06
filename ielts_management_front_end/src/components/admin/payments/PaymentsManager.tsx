"use client";

import React, { useState } from 'react';
import { DollarSign, Tag, TrendingUp, ShieldAlert } from 'lucide-react';
import { RevenueStatsTab } from './RevenueStatsTab';
import { DiscountsTab } from './DiscountsTab';
import { TopSpendersTab } from './TopSpendersTab';
import { Trophy } from 'lucide-react';

export function PaymentsManager() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'discounts' | 'spenders'>('revenue');

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 w-full animate-fadeIn">
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
          <div className="flex flex-wrap items-center gap-2 mt-8 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === 'revenue'
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Doanh Thu & Giao Dịch
            </button>



            <button
              onClick={() => setActiveTab('discounts')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === 'discounts'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Tag className="w-4 h-4" />
              Mã Khuyến Mãi
            </button>

            <button
              onClick={() => setActiveTab('spenders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === 'spenders'
                  ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Trophy className="w-4 h-4" />
              Top Học Viên VIP
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {activeTab === 'revenue' && <RevenueStatsTab />}
        {activeTab === 'discounts' && <DiscountsTab />}
        {activeTab === 'spenders' && <TopSpendersTab />}
      </div>
    </div>
  );
}

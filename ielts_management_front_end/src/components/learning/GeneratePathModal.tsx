import React, { useState, useEffect } from 'react';
import { learningPathService } from '@/services/learningPathService';
import Image from 'next/image';

interface GeneratePathModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'CN' },
];

const DURATIONS = [30, 60, 90, 120, 150, 180, 270];
const HOURS = [1, 2, 3, 4, 5, 6];

export const GeneratePathModal = ({ courseId, isOpen, onClose, onSuccess }: GeneratePathModalProps) => {
  const [duration, setDuration] = useState(60);
  const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [startDate, setStartDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Default to today
    const today = new Date();
    // Use local time, not UTC to avoid yesterday date issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setStartDate(`${year}-${month}-${day}`);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleDay = (dayValue: number) => {
    setAvailableDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleToggleAllDays = () => {
    if (availableDays.length === 7) {
      setAvailableDays([]);
    } else {
      setAvailableDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startDate || availableDays.length === 0) {
      setError('Vui lòng chọn ít nhất một ngày học trong tuần.');
      return;
    }

    // Calculate targetDate
    const start = new Date(startDate);
    const target = new Date(start);
    target.setDate(target.getDate() + duration);
    const targetDateStr = target.toISOString().split('T')[0];

    setLoading(true);
    setError(null);
    try {
      const res = await learningPathService.generatePath({
        courseId,
        targetDate: targetDateStr,
        availableDays,
        hoursPerDay
      });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#1888ff] to-[#5ba7ff] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 p-8 md:p-10 my-8">

        {/* Simple decorative background elements */}
        <div className="absolute top-10 left-10 w-3 h-3 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-40 right-10 w-5 h-5 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-20 right-40 w-2 h-2 bg-white rounded-full opacity-80"></div>
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-white rounded-full opacity-50"></div>

        {/* Cloud-like decorations using pure CSS blur */}
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center mb-10">
          <div className="flex items-end justify-center gap-2">
            <div className="w-24 h-24 flex items-center justify-center text-[80px] leading-none select-none drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
              <Image src="/inlectualBee.gif" alt="Robot" width={100} height={100} />
            </div>
            <div className="relative bg-white text-black px-6 py-4 rounded-3xl font-bold text-xl shadow-xl mb-8">
              Thiết lập lịch học
              <div className="absolute -bottom-2 left-6 w-6 h-6 bg-white transform rotate-45"></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="relative z-10 mb-6 p-4 rounded-xl bg-red-500 border-2 border-white text-white text-sm font-bold shadow-lg text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="relative z-10 flex flex-col gap-6 max-w-3xl mx-auto">
          {/* Thời lượng học dự kiến */}
          <div className="flex flex-col gap-3">
            <label className="text-white font-bold text-sm tracking-wide">Thời lượng học dự kiến</label>
            <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg overflow-x-auto custom-scrollbar border-2 border-white">
              {DURATIONS.map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${duration === days
                    ? 'bg-[#1888ff] text-white shadow-md transform scale-[1.02]'
                    : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'
                    }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
          </div>

          {/* Lịch học trong tuần */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-white font-bold text-sm tracking-wide">Lịch học trong tuần</label>
              <label className="flex items-center gap-2 text-white text-sm cursor-pointer font-bold bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={availableDays.length === 7}
                  onChange={handleToggleAllDays}
                  className="w-4 h-4 rounded border-white"
                />
                Tất cả
              </label>
            </div>
            <div className="flex gap-3 flex-wrap">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = availableDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleToggleDay(day.value)}
                    className={`flex-1 min-w-[90px] py-4 rounded-2xl text-sm font-bold transition-all border-4 shadow-lg ${isSelected
                      ? 'bg-[#1888ff] border-white text-white transform -translate-y-1'
                      : 'bg-white border-transparent text-gray-500 hover:border-gray-200 hover:-translate-y-0.5'
                      }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ngày bắt đầu */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-bold text-sm tracking-wide">Ngày bắt đầu</label>
              <div className="bg-white rounded-2xl p-4 flex items-center shadow-lg border-2 border-white">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent text-black font-bold outline-none"
                />
              </div>
            </div>

            {/* Số giờ học */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-bold text-sm tracking-wide">Số giờ rảnh mỗi ngày</label>
              <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg border-2 border-white overflow-x-auto">
                {HOURS.map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setHoursPerDay(hours)}
                    className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${hoursPerDay === hours
                      ? 'bg-[#1888ff] text-white shadow-md transform scale-[1.05]'
                      : 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100'
                      }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl font-bold bg-white/20 text-white hover:bg-white/30 transition-colors border-2 border-white/50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-4 rounded-2xl font-bold bg-[#f4e900] text-black hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(244,233,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tính toán...
                </>
              ) : 'Bắt đầu tạo lịch'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

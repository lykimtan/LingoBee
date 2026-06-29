/**
 * Practice Streak Component
 * Shows user's consistent practice streak
 */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import flashcardService from "@/services/flashcardService";

export const PracticeStreak = () => {
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await flashcardService.getDecks();
        if (response.streak) {
          setConsecutiveDays(response.streak.current);
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm h-full flex flex-col justify-center">
      {/* Decorative fire gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Image
                src="/profile/streak.gif"
                alt="Practice Streak"
                width={80}
                height={80}
                unoptimized
                sizes="40px"
                className="object-contain rounded-md"
              />
              Practice Streak
            </h3>
            <p className="text-muted-foreground text-sm">
              Bạn đã duy trì chuỗi Streak {loading ? "..." : consecutiveDays} ngày. Hãy giữ vững phong độ nhé.
            </p>
          </div>
          <div className="text-center ml-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(255, 255, 255)"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#fireGradient)"
                  strokeWidth="3"
                  strokeDasharray={`${(consecutiveDays / 30) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center text */}
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-foreground">
                  {loading ? "-" : consecutiveDays}
                </div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

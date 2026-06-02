import React from 'react';
import Link from 'next/link';
import { Clock, Tag, User, ChevronRight, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface PriceTier {
  price: number;
  discountPrice?: number;
}

interface Teacher {
  name: string;
  avatar?: string;
}

interface CourseProps {
  course: {
    title: string;
    slug: string;
    level?: string;
    category?: string;
    priceTiers?: PriceTier[];
    durationInHours?: number;
    teacher?: Teacher;
    publicInfo?: {
      thumbnail?: string;
    };
    description?: string;
  };
}

export default function CourseSuggestionCard({ course }: CourseProps) {
  // Lấy giá thấp nhất nếu có nhiều gói
  const lowestPriceTier = course.priceTiers?.length ? course.priceTiers[0] : null;
  const currentPrice = lowestPriceTier?.discountPrice || lowestPriceTier?.price;
  const originalPrice = lowestPriceTier?.discountPrice ? lowestPriceTier?.price : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="w-full max-w-[260px] flex flex-col bg-[#162933] rounded-xl border border-white/10 overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-amber-500/10">
      {/* Header / Thumbnail Area */}
      <div className="relative h-28 bg-gradient-to-br from-amber-500/20 to-[#0f1d24] flex items-center justify-center p-4">
        {course.publicInfo?.thumbnail ? (
          <Image
            src={course.publicInfo.thumbnail}
            alt={course.title}
            fill
            sizes="260px"
            className="object-cover w-auto opacity-80 mix-blend-overlay"
          />
        ) : (
          <BookOpen className="w-12 h-12 text-amber-500/40" />
        )}
        {/* Level Badge */}
        {course.level && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {course.level}
          </div>
        )}
      </div>

      {/* Body Area */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h4 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
          {course.title}
        </h4>

        {course.description && (
          <p className="text-xs text-white/60 line-clamp-2 mt-1">
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {course.category && (
            <div className="flex items-center gap-1 text-[10px] text-white/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              <Tag size={10} className="text-amber-500" />
              <span className="capitalize">{course.category}</span>
            </div>
          )}
          {course.durationInHours && (
            <div className="flex items-center gap-1 text-[10px] text-white/70 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              <Clock size={10} className="text-amber-500" />
              <span>{course.durationInHours} giờ</span>
            </div>
          )}
        </div>

        {course.teacher?.name && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center overflow-hidden">
              {course.teacher.avatar ? (
                <Image src={course.teacher.avatar} alt={course.teacher.name} width={16} height={16} className="object-cover" />
              ) : (
                <User size={10} className="text-amber-500" />
              )}
            </div>
            <span className="text-[11px] text-white/80 line-clamp-1">{course.teacher.name}</span>
          </div>
        )}

        {/* Price Area */}
        {currentPrice !== undefined && (
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-amber-400">{formatCurrency(currentPrice)}</span>
            {originalPrice && (
              <span className="text-[10px] text-white/40 line-through">{formatCurrency(originalPrice)}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Area */}
      <Link href={`/courses/${course.slug}`} className="block">
        <div className="bg-amber-500 hover:bg-amber-400 transition-colors py-2 flex items-center justify-center gap-1 text-[#0f1d24] font-medium text-xs">
          <span>Xem chi tiết</span>
          <ChevronRight size={14} />
        </div>
      </Link>
    </div>
  );
}

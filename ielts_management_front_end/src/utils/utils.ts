import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm tiện ích để làm sạch và bọc HTML
export const createSafeHtml = (htmlContent?: string) => {
  if (!htmlContent) return { __html: '' };
  
  // Tránh lỗi "window is not defined" khi Next.js render trên server (SSR)
  if (typeof window === 'undefined') {
    return { __html: '' };
  }
  
  return { __html: DOMPurify.sanitize(htmlContent) };
};

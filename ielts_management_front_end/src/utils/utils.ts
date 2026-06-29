import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm tiện ích để làm sạch và bọc HTML (Hỗ trợ cả Server và Client nhờ isomorphic-dompurify)
export const createSafeHtml = (htmlContent?: string) => {
  if (!htmlContent) return { __html: '' };

  return { __html: htmlContent };
};

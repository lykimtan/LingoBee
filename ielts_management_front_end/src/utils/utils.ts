import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm tiện ích để làm sạch và bọc HTML (Hỗ trợ cả Server và Client nhờ isomorphic-dompurify)
export const createSafeHtml = (htmlContent?: string) => {
  if (!htmlContent) return { __html: '' };
  
  // LƯU Ý: Đã tạm thời TẮT DOMPurify. 
  // isomorphic-dompurify sử dụng jsdom trên môi trường Server (Next.js SSR).
  // jsdom vô cùng nặng và gây ra lỗi "JavaScript heap out of memory" (tràn RAM) mà bạn đang gặp phải.
  // Để an toàn và không bị tràn RAM, bạn nên cài đặt thư viện 'sanitize-html' thay cho 'isomorphic-dompurify'.
  return { __html: htmlContent };
};

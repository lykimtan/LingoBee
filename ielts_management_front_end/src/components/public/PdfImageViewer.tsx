"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface PdfImageViewerProps {
  pdfUrl: string;
  className?: string;
}

export default function PdfImageViewer({ pdfUrl, className = "" }: PdfImageViewerProps) {
  const [pages, setPages] = useState<number[]>([1]); // Start with page 1
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set([1]));
  const [errorPages, setErrorPages] = useState<Set<number>>(new Set());

  // Reset when pdfUrl changes
  useEffect(() => {
    setPages([1]);
    setLoadingPages(new Set([1]));
    setErrorPages(new Set());
  }, [pdfUrl]);

  // Helper to generate the image URL for a specific page
  const getPageUrl = (url: string, pageNumber: number) => {
    if (!url) return "";
    try {
      // url example: https://res.cloudinary.com/dvxxxxx/image/upload/v173155/materials/file.pdf
      // target: https://res.cloudinary.com/dvxxxxx/image/upload/pg_1/v173155/materials/file.jpg

      // 1. Replace .pdf with .jpg (case insensitive)
      let imageUrl = url.replace(/\.pdf$/i, ".jpg");

      // 2. Insert pg_{number} after /upload/
      const uploadIdx = imageUrl.indexOf("/upload/");
      if (uploadIdx !== -1) {
        const beforeUpload = imageUrl.substring(0, uploadIdx + 8); // includes "/upload/"
        const afterUpload = imageUrl.substring(uploadIdx + 8);
        imageUrl = `${beforeUpload}pg_${pageNumber}/${afterUpload}`;
      }

      return imageUrl;
    } catch (error) {
      console.error("Error transforming PDF URL:", error);
      return url;
    }
  };

  const handleImageLoad = (pageNumber: number) => {
    setLoadingPages((prev) => {
      const next = new Set(prev);
      next.delete(pageNumber);
      return next;
    });

    // If the image loaded successfully, queue the next page to try loading it
    setPages((prev) => {
      if (!prev.includes(pageNumber + 1)) {
        setLoadingPages((prevLoading) => new Set(prevLoading).add(pageNumber + 1));
        return [...prev, pageNumber + 1];
      }
      return prev;
    });
  };

  const handleImageError = (pageNumber: number) => {
    setLoadingPages((prev) => {
      const next = new Set(prev);
      next.delete(pageNumber);
      return next;
    });
    setErrorPages((prev) => new Set(prev).add(pageNumber));
  };

  return (
    <div className={`flex flex-col items-center bg-gray-50/50 rounded-xl overflow-hidden ${className}`}>
      {pages.map((pageNumber) => {
        // If this page errored out (likely 404 because we exceeded the PDF length), don't render it
        if (errorPages.has(pageNumber)) {
          return null;
        }

        const isLoading = loadingPages.has(pageNumber);
        const imageUrl = getPageUrl(pdfUrl, pageNumber);

        return (
          <div key={pageNumber} className="relative w-full border-b border-gray-200 last:border-b-0 bg-white">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100/80 min-h-[600px] animate-pulse">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-500">Đang tải trang {pageNumber}...</p>
              </div>
            )}
            
            {/* 
              Using unoptimized img tag instead of Next.js Image because we don't know the intrinsic dimensions of each PDF page in advance,
              and we want it to scale naturally based on the container width.
            */}
            <img
              src={imageUrl}
              alt={`Page ${pageNumber}`}
              className={`w-full h-auto object-contain transition-opacity duration-300 ${
                isLoading ? "opacity-0 min-h-[600px]" : "opacity-100"
              }`}
              onLoad={() => handleImageLoad(pageNumber)}
              onError={() => handleImageError(pageNumber)}
            />
          </div>
        );
      })}

      {/* If page 1 errored, the whole PDF couldn't be loaded (e.g. wasn't uploaded as image resource_type) */}
      {errorPages.has(1) && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 font-bold text-xl">!</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Không thể hiển thị tài liệu</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Đã có lỗi xảy ra hoặc định dạng tài liệu không được hỗ trợ để xem trước. Bạn có thể tải xuống tài liệu để xem.
          </p>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noreferrer"
            className="mt-6 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Tải xuống tài liệu gốc
          </a>
        </div>
      )}
    </div>
  );
}

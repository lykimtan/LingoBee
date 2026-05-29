"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import PdfImageViewer from "./PdfImageViewer";

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export default function PdfModal({ isOpen, onClose, pdfUrl, title = "Tài liệu đính kèm" }: PdfModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
        <h3 className="text-lg font-bold text-white truncate max-w-2xl">{title}</h3>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-5xl shadow-2xl ring-1 ring-white/10 rounded-xl bg-white">
          <PdfImageViewer pdfUrl={pdfUrl} />
        </div>
      </div>
    </div>
  );
}

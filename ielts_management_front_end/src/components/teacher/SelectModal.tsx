import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2 } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
}

interface SelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedValue: string | number) => void;
  options: SelectOption[];
  initialValue?: string | number;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function SelectModal({
  isOpen,
  onClose,
  onConfirm,
  options,
  initialValue,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isLoading = false,
}: SelectModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  const [selectedValue, setSelectedValue] = useState<string | number | null>(initialValue ?? null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Kỹ thuật chuẩn React: Reset state trực tiếp khi prop thay đổi mà KHÔNG dùng useEffect
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedValue(initialValue ?? null);
    }
  }

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
    //eslint-disable-next-line
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!isRendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRendered]);

  const handleConfirm = () => {
    if (selectedValue !== null) {
      onConfirm(selectedValue);
    }
  };

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all duration-300 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0 sm:translate-y-0"
        }`}
      >
        <button
          onClick={!isLoading ? onClose : undefined}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 pr-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {message && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>}
        </div>

        {/* Options List */}
        <div className="custom-scrollbar max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <div
                key={option.value}
                onClick={() => !isLoading && setSelectedValue(option.value)}
                className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#1f6f5e] bg-[#1f6f5e]/5"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div className="flex flex-col pr-8">
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-[#1f6f5e]" : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="mt-1 text-xs text-gray-500">{option.description}</span>
                  )}
                </div>
                
                {/* Radio indicator */}
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[#1f6f5e] bg-[#1f6f5e]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || selectedValue === null}
            className="flex min-w-[100px] items-center justify-center rounded-xl bg-[#1f6f5e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#165443] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
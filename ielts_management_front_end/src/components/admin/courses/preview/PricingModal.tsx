import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign } from 'lucide-react';

interface PriceTier {
  name: string;
  price: number;
  description?: string;
  features?: string[];
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (priceTiers: PriceTier[]) => void;
  initialPriceTiers?: PriceTier[];
  isLoading?: boolean;
}

export default function PricingModal({
  isOpen,
  onClose,
  onSave,
  initialPriceTiers = [],
  isLoading = false,
}: PricingModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [isFree, setIsFree] = useState(() => {
    if (initialPriceTiers.length > 0) {
      return initialPriceTiers[0].price === 0;
    }
    return true; // Default UI state if not set
  });
  const [price, setPrice] = useState<number>(initialPriceTiers[0]?.price || 0);

  useEffect(() => {
    if (isOpen) {
      if (initialPriceTiers.length > 0) {
        setIsFree(initialPriceTiers[0].price === 0);
        setPrice(initialPriceTiers[0].price);
      } else {
        setIsFree(true);
        setPrice(0);
      }
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialPriceTiers]);

  useEffect(() => {
    if (!isRendered) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isRendered]);

  if (!isRendered || typeof document === "undefined") return null;

  const handleSave = () => {
    if (isFree) {
      onSave([{
        name: 'Miễn phí',
        price: 0,
        description: 'Khóa học miễn phí',
      }]);
    } else {
      onSave([{
        name: 'Basic',
        price: Number(price),
        description: 'Mức giá cơ bản của khóa học',
      }]);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <button
          onClick={!isLoading ? onClose : undefined}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="mt-1 w-full">
            <h3 className="text-lg font-semibold text-gray-900">Thiết lập giá khóa học</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              Chọn mức giá phù hợp cho khóa học của bạn.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pricingType"
                    checked={isFree}
                    onChange={() => setIsFree(true)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  Miễn phí
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pricingType"
                    checked={!isFree}
                    onChange={() => setIsFree(false)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  Có phí
                </label>
              </div>

              {!isFree && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá tiền (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="VD: 500000"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-500 text-sm">VNĐ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center justify-center min-w-[100px] rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-[#1f6f5e] hover:bg-[#165443] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

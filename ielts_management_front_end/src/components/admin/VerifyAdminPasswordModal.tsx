"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Shield, Key, Loader2, AlertCircle, Lock } from "lucide-react";

interface VerifyAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
  actionDescription?: string;
}

export const VerifyAdminPasswordModal: React.FC<VerifyAdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Xác thực bảo mật Quản trị viên",
  message,
  actionDescription,
}) => {
  const displayMessage =
    message ||
    (actionDescription
      ? `Vui lòng nhập mật khẩu tài khoản Admin của bạn để ${actionDescription}.`
      : "Thao tác cấp quyền này rất quan trọng. Vui lòng nhập mật khẩu tài khoản Admin của bạn để tiếp tục.");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Vui lòng nhập mật khẩu xác thực.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.verifyPassword({ password });
      if (res.status !== "success") {
        throw new Error(res.message || "Mật khẩu không chính xác");
      }
      setPassword("");
      onSuccess();
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err.message || "Xác thực mật khẩu thất bại";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isNoPasswordError = error && error.includes("chưa thiết lập mật khẩu");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121c1f] p-6 shadow-2xl transition-all">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 mb-3 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">{displayMessage}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                required
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 py-3 text-white text-sm outline-none transition-colors focus:border-yellow-400/60 placeholder:text-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
              {isNoPasswordError && (
                <Link
                  href="/admin/myAccount"
                  onClick={onClose}
                  className="mt-1 text-center inline-block w-full py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors"
                >
                  Thiết lập mật khẩu ngay
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm shadow-lg shadow-yellow-400/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <span>Xác nhận</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

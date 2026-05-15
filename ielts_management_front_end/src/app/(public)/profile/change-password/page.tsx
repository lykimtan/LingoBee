"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.changePassword({ currentPassword, newPassword });
      if (response.status !== "success") {
        throw new Error(response.message || "Không thể đổi mật khẩu");
      }

      setMessage("Đã đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] px-6 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/60">Security</p>
        <h1 className="mt-3 text-3xl font-semibold">Đổi mật khẩu</h1>
        <p className="mt-3 text-white/60">Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/70">Mật khẩu hiện tại</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#1b1b1d] px-4 py-3 outline-none focus:border-[#f4e900]/60"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/70">Mật khẩu mới</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#1b1b1d] px-4 py-3 outline-none focus:border-[#f4e900]/60"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/70">Xác nhận mật khẩu mới</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#1b1b1d] px-4 py-3 outline-none focus:border-[#f4e900]/60"
              required
            />
          </label>

          {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/profile/editProfile")}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#f4e900] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-white/50">
          <Link href="/profile" className="underline underline-offset-4 hover:text-white">
            Quay về trang hồ sơ
          </Link>
        </div>
      </div>
    </div>
  );
}
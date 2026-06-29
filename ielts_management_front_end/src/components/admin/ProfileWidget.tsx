'use client';
import { Mail, Shield, Calendar, UserCheck, Lock, CheckCircle2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export function ProfileWidget() {
  const { user } = useAuthContext();
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-white/5 p-4 shadow-sm backdrop-blur-md border border-white/10">
      {/* Profile Image & Info */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0a1a1c]">
        <div className="aspect-[4/3] w-full bg-cover bg-center" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d20]/90 via-[#0b1d20]/40 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <h3 className="text-lg font-medium">{user?.name || "Admin"}</h3>
            <p className="text-xs text-[#ffb800] font-medium">{user?.email || "Quản trị viên hệ thống"}</p>
          </div>
          <span className="rounded-full bg-[#1f6f5e]/80 px-2.5 py-0.5 text-[10px] font-semibold text-white border border-[#1f6f5e]">
            Online
          </span>
        </div>
      </div>

      {/* Admin Information List */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] bg-[#0a1a1c] p-4 shadow-sm border border-white/5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Thông tin tài khoản</span>
          <Shield className="h-4 w-4 text-[#ffb800]" />
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 py-1.5 border-b border-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-400">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/50">Email đăng nhập</p>
            <p className="truncate text-xs font-medium text-white/90">{user?.email || "admin@lingobee.edu.vn"}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-3 py-1.5 border-b border-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#ffb800]">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/50">Vai trò (Role)</p>
            <p className="text-xs font-medium text-white/90">Quản trị viên tối cao (Super Admin)</p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-3 py-1.5 border-b border-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/50">Ngày kích hoạt</p>
            <p className="text-xs font-medium text-white/90">{formatDate(user?.createdAt)}</p>
          </div>
        </div>

        {/* Security / Permissions */}
        <div className="flex items-center gap-3 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-purple-400">
            <Lock className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/50">Quyền truy cập</p>
            <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Toàn quyền hệ thống
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

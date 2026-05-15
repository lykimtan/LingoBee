"use client";

import Link from "next/link";
import { Bell, Settings, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Khóa học", href: "/admin/courses" },
    { label: "Học viên", href: "/admin/students" },
    { label: "Giáo viên", href: "/admin/teachers" },
    { label: "Thanh toán", href: "/admin/payments" },
    { label: "Lịch trình", href: "/admin/schedule" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await void logout();
    router.push("login");
  };

  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center">
        <div className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0a1a1c] px-6 shadow-sm">
          <Image src="/Bee.gif" alt="LingoBee logo" width={28} height={28} className="object-contain" />
          <span className="text-xl font-medium tracking-tight text-white">
            Lingo<span className="font-bold text-[#ffb800]">Bee</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden items-center gap-2 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${isActive(item.href)
              ? "bg-[#1f6f5e] text-white shadow-lg shadow-[#1f6f5e]/40"
              : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5">
          <Settings className="h-4 w-4" />
          Setting
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shadow-sm hover:bg-white/10">
          <Bell className="h-4 w-4 text-white/70" />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/5 shadow-sm hover:bg-white/10"
          aria-label="User profile"
          type="button"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User avatar"}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-white/70" />
          )}
        </button>
        <button
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5"
          onClick={handleLogout}
          type="button"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

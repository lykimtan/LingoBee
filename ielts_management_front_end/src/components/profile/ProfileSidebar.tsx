/**
 * Profile Sidebar Component
 * Navigation sidebar for student profile page
 */

"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: string;
};

const menuItems: ProfileMenuItem[] = [
  { label: "Tổng quan", href: "/profile", icon: "/profile/chart.gif" },
  { label: "Listening", href: "/profile/listening", icon: "/profile/headphones.gif" },
  { label: "Reading", href: "/profile/reading", icon: "/profile/reading.gif" },
  { label: "Writing", href: "/profile/writing", icon: "/profile/writting.gif" },
  { label: "Speaking", href: "/profile/speaking", icon: "/profile/speaking.gif" },
];

const isImageIcon = (icon: string): boolean => {
  return icon.startsWith("/");
};

export const ProfileSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthContext();

  return (
    <aside className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-64 bg-gradient-to-b from-background to-background/80 border-r border-white/10 backdrop-blur-sm overflow-y-auto">
      <nav className="p-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/profile" && pathname === "/profile");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-white/10 text-foreground border border-white/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {isImageIcon(item.icon) ? (
                <div className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Help Center Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent space-y-2">
        <Link
          href="/profile/editProfile"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground rounded-lg transition-all duration-300 hover:text-foreground hover:bg-white/10 hover:border hover:border-white/20 group"
        >
          <div className="relative w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/profile/setting.gif"
              alt="Settings"
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>
          <span className="transition-colors duration-300">Chỉnh sửa hồ sơ cá nhân</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground rounded-lg transition-all duration-300 hover:text-foreground hover:bg-white/10 hover:border hover:border-white/20 group"
            onClick={() => {
              void logout().then(() => {
                router.push("/login");
              });
            }}
        >
          <div className="relative w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/profile/logout.gif"
              alt="Logout"
              fill
              sizes="24px"
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="transition-colors duration-300">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

"use client";

import Link from "next/link";
import { Bell, Settings, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "@/context/AuthContext";
import { API_BASE_URL, STORAGE_KEYS } from "@/constants";
import { notificationService } from "@/services/notificationService";

type NotificationItem = {
  _id?: string;
  id?: string;
  notificationType?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  actionUrl?: string | null;
  isRead?: boolean;
  recipientUser?: string | null;
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

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

  const notificationsList = useMemo(() => {
    return notifications.slice(0, 6);
  }, [notifications]);

  const markAllRead = async () => {
    const response = await notificationService.markAllAsRead();
    if (response.status === "success") {
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const storedToken =
      typeof window === "undefined"
        ? null
        : localStorage.getItem(STORAGE_KEYS.USER_TOKEN) ||
          sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);

    if (!storedToken || !user?.id) {
      return;
    }

    const loadNotifications = async () => {
      const response = await notificationService.getUnreadNotifications();

      if (response.status === "success" && Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((item) => item.isRead === false).length);
      } else {
        setNotificationsError(response.message || "Không thể tải thông báo.");
      }
    };

    void loadNotifications();

    socketRef.current = io(API_BASE_URL, {
      auth: { token: storedToken },
      transports: ["websocket"],
    });

    socketRef.current.on("notification:new", (payload: NotificationItem) => {
      if (payload.recipientUser && payload.recipientUser !== user.id) {
        return;
      }

      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

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
        
        <div className="relative z-50" ref={menuRef}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shadow-sm hover:bg-white/10"
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              if (unreadCount > 0) {
                void markAllRead();
              }
            }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ffb800] px-1 text-[10px] font-semibold text-black">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a1c] shadow-xl">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">Thông báo</p>
                <p className="text-xs text-white/50">
                  {unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : "Không có thông báo mới"}
                </p>
              </div>
              <div className="max-h-80 overflow-auto">
                {notificationsError && (
                  <div className="px-4 py-3 text-xs text-red-400">{notificationsError}</div>
                )}
                {!notificationsError && notificationsList.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-white/50">
                    Chưa có thông báo nào.
                  </div>
                )}
                {!notificationsError &&
                  notificationsList.map((item, index) => {
                    const content = (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                            {item.notificationType || "notification"}
                          </span>
                          {item.createdAt && (
                            <span className="text-[10px] text-white/40">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white mt-1">{item.title}</p>
                        <p className="text-xs text-white/60">{item.message}</p>
                      </>
                    );

                    const className = "flex flex-col border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 last:border-b-0 block";

                    if (item.actionUrl) {
                      return (
                        <Link
                          href={item.actionUrl}
                          key={item._id || item.id || index}
                          className={className}
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={item._id || item.id || index} className={className}>
                        {content}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

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

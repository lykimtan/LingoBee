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

export function TeacherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastScrollYRef = useRef(0);
  const navItems = [
    { label: "Dashboard", href: "/teacher" },
    { label: "Khóa học", href: "/teacher/courses" },
    { label: "Học viên", href: "/teacher/students" },
    { label: "Đề thi ĐGNL", href: "/teacher/placement-questions" },
    { label: "Cài đặt", href: "/teacher/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/teacher") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
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
    const scrollContainer = document.querySelector<HTMLElement>("[data-teacher-scroll]");
    const target = scrollContainer ?? window;

    const getScrollTop = () =>
      target === window
        ? window.scrollY
        : (scrollContainer?.scrollTop ?? 0);

    lastScrollYRef.current = getScrollTop();

    const handleScroll = () => {
      const currentScrollY = getScrollTop();
      const delta = currentScrollY - lastScrollYRef.current;

      if (delta > 12 && currentScrollY > 80) {
        setIsHeaderVisible(false);
      } else if (delta < 0) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <header
      className={`sticky top-0 z-30 flex w-full items-center justify-between px-6 py-4 shadow-sm backdrop-blur-md transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* Logo */}
      <div className="flex items-center">
        <div className="flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 shadow-sm">
          <Image src="/Bee.gif" alt="LingoBee logo" width={28} height={28} className="object-contain" />
          <span className="text-xl font-medium tracking-tight text-gray-900">
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
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <Settings className="h-4 w-4" />
          Setting
        </button>
        <div className="relative" ref={menuRef}>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              if (unreadCount > 0) {
                void markAllRead();
              }
            }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ffb800] px-1 text-[10px] font-semibold text-black">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Thông báo</p>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : "Không có thông báo mới"}
                </p>
              </div>
              <div className="max-h-80 overflow-auto">
                {notificationsError && (
                  <div className="px-4 py-3 text-xs text-red-500">{notificationsError}</div>
                )}
                {!notificationsError && notificationsList.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-gray-500">
                    Chưa có thông báo nào.
                  </div>
                )}
                {!notificationsError &&
                  notificationsList.map((item, index) => (
                    <div
                      key={item._id || item.id || index}
                      className="flex flex-col gap-1 border-b border-gray-100 px-4 py-3 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {item.notificationType || "notification"}
                        </span>
                        {item.createdAt && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm hover:bg-gray-50"
          aria-label="User profile"
          type="button"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "Teacher avatar"}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </button>
        <button
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          onClick={() => {
            void logout().then(() => {
              router.push("/login");
            });
          }}
          type="button"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

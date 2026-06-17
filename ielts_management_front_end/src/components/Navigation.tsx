/**
 * Navigation Component
 * Fixed glassmorphic navigation bar with logo and links
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
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

export const Navigation = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const notifMenuRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
      if (!notifMenuRef.current) {
        return;
      }

      if (!notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY.current ? "down" : "up";

      if (scrollDirection === "down" && currentScrollY > 100) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg transition-transform duration-300 ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}>
      <div className="flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/Bee.gif"
            alt="LingoBee"
            width={60}
            height={60}
            unoptimized
            loading="eager"
            className="object-contain"
          />
          <div className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            LingoBee<sup className="text-xs">®</sup>
          </div>
        </div>

        {/* Nav Links - Hidden on mobile */}
        <div className="hidden md:flex flex-row gap-12 items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors h-6"
            aria-label="Trang chủ"
          >
            <Image
              src="/homepage/homee.gif"
              alt="Trang chủ"
              width={50}
              height={50}
              unoptimized
              className="h-8 w-auto"
            />
            <span>Trang chủ</span>
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors h-6"
            aria-label="Trang chủ"
          >
            <Image
              src="/homepage/course.gif"
              alt="Khóa học"
              width={50}
              height={50}
              unoptimized
              className="h-8 w-auto"
            />
            <span>Khóa học</span>
          </Link>
          <Link
            href="/vocabulary-tools"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors h-6"
            aria-label="Đề thi tổng hợp"
          >
            <Image
              src="/homepage/ielts_test.gif"
              alt="Đề thi tổng hợp"
              width={50}
              height={50}
              unoptimized
              className="h-8 w-auto"
            />
            <span>Công cụ học tập</span>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors h-6"
            aria-label="Về chúng tôi"
          >
            <Image
              src="/homepage/about.gif"
              alt="Về chúng tôi"
              width={50}
              height={50}
              unoptimized
              className="h-8 w-auto"
            />
            <span>Về chúng tôi</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors h-6"
            aria-label="Liên hệ"
          >
            <Image
              src="/homepage/contact.gif"
              alt="Liên hệ"
              width={50}
              height={50}
              unoptimized
              className="h-8 w-auto"
            />
            <span>Liên hệ</span>
          </Link>
        </div>

        {/* CTA Button */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifMenuRef}>
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
                {unreadCount > 0 ? (
                  <Image
                    src="/NotificationBellActive.gif"
                    alt="Active Notifications"
                    width={24}
                    height={24}
                    unoptimized
                    style={{ width: "auto", height: "auto" }}
                    className="h-6 w-6"
                  />
                ) : (
                  <Image
                    src="/NotificationBell.gif"
                    alt="Notifications"
                    width={24}
                    height={24}
                    unoptimized
                    style={{ width: "auto", height: "auto" }}
                    className="h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
                  />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ffb800] px-1 text-[10px] font-semibold text-black">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
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

                        const className = "flex flex-col border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/10 last:border-b-0 block";

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

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="liquid-glass rounded-full px-4 py-2 text-sm text-foreground hover:scale-[1.03] transition-transform flex items-center gap-3"
              >
                <Image
                  src={user.avatar || "/default_images/avatar.jpg"}
                  alt={user.name}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full object-cover border border-white/20"
                />
                <span className="max-w-[160px] truncate">{user.name}</span>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.35)] p-2">
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors"
                  >
                    Tài khoản của tôi
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void logout().then(() => {
                        router.push("/login");
                      });
                    }}
                    disabled={isLoading}
                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors disabled:opacity-60"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/register"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform"
          >
            Begin Journey
          </Link>
        )}
      </div>
    </nav>
  );
};

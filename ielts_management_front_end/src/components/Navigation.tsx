/**
 * Navigation Component
 * Fixed glassmorphic navigation bar with logo and links
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const Navigation = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg transition-transform duration-300 ${
      isNavbarVisible ? "translate-y-0" : "-translate-y-full"
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
              href="/ielts-mock-test"
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
              <span>Đề thi tổng hợp</span>
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

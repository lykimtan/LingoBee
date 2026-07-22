"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { isValidEmail } from "@/utils/helpers";

export const LoginPanel = () => {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [oauthError, setOauthError] = useState("");

  const getRedirectPath = (role?: string) => {
    if (role === "admin") return "/admin";
    if (role === "teacher") return "/teacher";
    return "/";
  };

  const isFormValid = isValidEmail(email) && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login({ email, password }, { remember: rememberMe });
      if (result) {
        setSuccessMessage("Login successful! Redirecting...");
        setEmail("");
        setPassword("");
        const role = result.data?.user?.role;
        const redirectPath = getRedirectPath(role);

        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      }
    } catch {
      // Error is handled by useAuth hook
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setOauthError("Google login chưa được cấu hình.");
      return;
    }

    setOauthError("");
    const redirectUri =
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${window.location.origin}/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
    });

    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-3xl font-bold text-white mb-3">
          Welcome to
          <span className="text-3xl md:text-5xl"> LingoBee</span>
        </h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-green-400 text-sm">
          ✓ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {authError && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          ✗ {authError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Email
          </label>
          <input
            type="email"
            placeholder="name@laboratory.io"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            }}
            className={`w-full px-6 py-3 rounded-full bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-white/20 transition-all duration-200 backdrop-blur-sm ${errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20"
              }`}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
              Password
            </label>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.password;
                    return newErrors;
                  });
                }
              }}
              className={`w-full px-6 pr-20 py-3 rounded-full bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-white/20 transition-all duration-200 backdrop-blur-sm ${errors.password ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 text-xs text-gray-300 hover:text-white transition-colors"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-yellow-50 focus:ring-yellow-50/40"
            />
            Ghi nhớ tôi
          </label>
        </div>

        {/* Primary Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full px-8 py-3 rounded-full bg-yellow-50 text-slate-900 font-semibold uppercase tracking-wide text-sm hover:bg-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
        >
          {isLoading ? "Accessing..." : "Đăng nhập"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-gray-500 uppercase tracking-widest">
            Phương thức đăng nhập khác
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all duration-200 uppercase tracking-wide text-sm font-medium"
        >
          Đăng nhập với Google
        </button>
        {oauthError && <p className="text-xs text-red-400">{oauthError}</p>}
      </div>

      {/* Bottom Links */}
      <div className="mt-8 pt-8 border-t border-white/10 space-y-4 text-center">
        <p className="text-sm text-gray-400">
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className="text-white hover:text-yellow-50 transition-colors font-medium">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

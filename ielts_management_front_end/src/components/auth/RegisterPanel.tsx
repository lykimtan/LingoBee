"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateRegisterForm } from "@/utils/helpers";

export const RegisterPanel = () => {
  const router = useRouter();
  const { register, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oauthError, setOauthError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    // Validate form
    const validation = validateRegisterForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // Call register from useAuth hook
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result) {
        setSuccessMessage(result.message || "Account created successfully! Redirecting...");
        setErrors({});
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });

        // Redirect to home or dashboard after 1.5 seconds
        setTimeout(() => {
          router.push("/");
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Bắt đầu hành trình với LingoBee
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Chinh phục Ielts trong tầm tay của bạn
        </p>
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
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="LingoBee Student"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-6 py-3 rounded-full bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-white/20 transition-all duration-200 backdrop-blur-sm ${errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20"
              }`}
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@gmail.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-6 py-3 rounded-full bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-white/20 transition-all duration-200 backdrop-blur-sm ${errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20"
              }`}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
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
          <p className="text-gray-500 text-xs mt-1">Ít nhất 6 ký tự, 1 chữ hoa, 1 chữ thường, 1 số</p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-6 pr-20 py-3 rounded-full bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-white/20 transition-all duration-200 backdrop-blur-sm ${errors.confirmPassword ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 text-xs text-gray-300 hover:text-white transition-colors"
            >
              {showConfirmPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
        </div>

        {/* Primary Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-8 py-3 rounded-full bg-yellow-50 text-slate-900 font-semibold uppercase tracking-wide text-sm hover:bg-white transition-all duration-200 disabled:opacity-70 mt-8"
        >
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản ngay"}
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
          Google
        </button>
        {oauthError && <p className="text-xs text-red-400">{oauthError}</p>}
      </div>

      {/* Bottom Links */}
      <div className="mt-8 pt-8 border-t border-white/10 space-y-4 text-center">
        <p className="text-sm text-gray-400">
          Bạn đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-white hover:text-yellow-50 transition-colors font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

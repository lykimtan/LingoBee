"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import { uploadService } from "@/services/uploadService";
import { authService } from "@/services/authService";
import { apiClient } from "@/utils/api";
import {
    User as UserIcon,
    Shield,
    Key,
    Camera,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Lock,
    Mail,
    Calendar,
    RefreshCw
} from "lucide-react";

const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);
};

export default function AdminMyAccountPage() {
    const { user, updateProfile } = useAuthContext();

    // Profile State
    const [displayName, setDisplayName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Security State
    const [hasPassword, setHasPassword] = useState<boolean | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Fetch real user info from backend on mount to accurately check hasPassword
    const fetchFreshUserData = async () => {
        setCheckingAuth(true);
        try {
            const res: any = await apiClient.get("/api/auth/me");
            const freshData = res.data || res;
            if (freshData) {
                if (freshData.name) setDisplayName(freshData.name);
                if (freshData.avatar !== undefined) setAvatarPreview(freshData.avatar || null);
                if (typeof freshData.hasPassword === "boolean") {
                    setHasPassword(freshData.hasPassword);
                } else {
                    setHasPassword(false);
                }
            }
        } catch (err) {
            console.error("Lỗi tải thông tin tài khoản:", err);
            // Fallback to context user
            if (user) {
                setDisplayName(user.name || "");
                setAvatarPreview(user.avatar || null);
                setHasPassword(Boolean(user.hasPassword));
            }
        } finally {
            setCheckingAuth(false);
        }
    };

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "");
            setAvatarPreview(user.avatar || null);
            if (user.hasPassword !== undefined) {
                setHasPassword(user.hasPassword);
            }
        }
        fetchFreshUserData();
    }, [user]);

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    // Handle Avatar Selection
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setProfileError(null);
        setProfileSuccess(null);

        if (!file) return;

        if (avatarPreview && avatarPreview.startsWith("blob:")) {
            URL.revokeObjectURL(avatarPreview);
        }

        setSelectedAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Submit Profile Form
    const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProfileError(null);
        setProfileSuccess(null);
        setIsSubmittingProfile(true);

        try {
            let avatarUrl = user?.avatar || "";

            if (selectedAvatar) {
                const signatureResponse = await uploadService.requestSignature({
                    resourceType: "image",
                    folder: "avatars",
                });

                if (signatureResponse.status !== "success" || !signatureResponse.data) {
                    throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload ảnh");
                }

                const uploaded = await uploadService.uploadToCloudinary(
                    selectedAvatar,
                    signatureResponse.data
                );

                avatarUrl = uploaded.secure_url;
            }

            const payload = {
                name: displayName.trim(),
                ...(avatarUrl ? { avatar: avatarUrl } : {}),
            };

            const response = await updateProfile(payload);
            if (!response || response.status !== "success") {
                throw new Error((response as any)?.message || "Cập nhật thông tin thất bại");
            }

            setSelectedAvatar(null);
            setProfileSuccess("Cập nhật hồ sơ thành công!");
        } catch (error: any) {
            setProfileError(error.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    // Submit Password Form (Create or Change)
    const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (newPassword.length < 6) {
            setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Xác nhận mật khẩu mới không khớp.");
            return;
        }

        if (hasPassword && !currentPassword) {
            setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }

        setIsSubmittingPassword(true);
        try {
            const payload: any = { newPassword };
            if (hasPassword) {
                payload.currentPassword = currentPassword;
            }

            const response = await authService.changePassword(payload);
            if (response.status !== "success") {
                throw new Error(response.message || "Thao tác mật khẩu thất bại");
            }

            setPasswordSuccess(hasPassword ? "Đổi mật khẩu thành công!" : "Tạo mật khẩu thành công! Giờ bạn có thể đăng nhập bằng Email.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setHasPassword(true); // User now has a password
        } catch (error: any) {
            setPasswordError(error?.response?.data?.message || error.message || "Thao tác mật khẩu thất bại");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    if (checkingAuth && !user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-16 space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d262a] via-[#14363c] to-[#0d262a] border border-teal-500/20 p-8 md:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Cổng Quản trị viên</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Tài khoản của tôi
                        </h1>
                        <p className="text-white/60 max-w-xl text-sm leading-relaxed">
                            Quản lý thông tin cá nhân, cập nhật ảnh đại diện và thiết lập bảo mật mật khẩu dành riêng cho Quản trị viên hệ thống.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5">
                        <div>
                            <span className="text-[11px] text-white/40 block uppercase tracking-wider font-semibold">Vai trò hệ thống</span>
                            <span className="text-sm font-bold text-teal-300 capitalize">
                                {user?.role === "admin" ? "Super Administrator" : user?.role || "Admin"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-6 space-y-8">
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-6 md:p-8 overflow-hidden">
                        {isSubmittingProfile && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm transition-all">
                                <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                                <span className="text-sm font-semibold tracking-widest text-white uppercase">Đang lưu thay đổi...</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Hồ sơ cá nhân</h2>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="pt-6 space-y-6">
                            {/* Avatar Picker */}
                            <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-teal-400 via-yellow-400 to-transparent shadow-xl relative overflow-hidden">
                                        <div className="w-full h-full rounded-full overflow-hidden relative bg-[#142e32]">
                                            <Image
                                                src={avatarPreview || "/default_images/avatar.jpg"}
                                                alt={user?.name || "Avatar"}
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                    <label
                                        htmlFor="admin-avatar-upload"
                                        className="absolute bottom-1 right-1 p-2 rounded-full bg-yellow-400 text-black shadow-lg cursor-pointer hover:bg-yellow-300 transition-transform active:scale-95"
                                        title="Thay đổi ảnh đại diện"
                                    >
                                        <Camera className="w-4 h-4 font-bold" />
                                    </label>
                                    <input
                                        id="admin-avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="text-center">
                                    <span className="text-sm font-medium text-white block">Ảnh đại diện Admin</span>
                                    <span className="text-xs text-white/40 block mt-0.5">Định dạng JPG, PNG hoặc GIF (Tối đa 5MB)</span>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                        Họ & Tên hiển thị
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                        placeholder="Nhập tên hiển thị"
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm outline-none transition-colors focus:border-teal-400/60"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                        Địa chỉ Email (Định danh)
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-white/30 absolute left-4 top-3.5" />
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            readOnly
                                            className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3 text-white/50 text-sm outline-none cursor-not-allowed select-none"
                                        />
                                    </div>
                                    <span className="text-[11px] text-white/30 mt-1 block italic">Email quản trị không thể thay đổi vì lý do bảo mật.</span>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                        Thời gian tham gia hệ thống
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-white/30 absolute left-4 top-3.5" />
                                        <div className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3 text-white/70 text-sm">
                                            {formatDateTime(user?.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alerts */}
                            {profileError && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                                    <span>{profileError}</span>
                                </div>
                            )}
                            {profileSuccess && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingProfile}
                                    className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-bold text-sm shadow-lg shadow-teal-400/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {isSubmittingProfile ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <span>Lưu thông tin</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Security Card */}
                <div className="lg:col-span-6 space-y-8">
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-6 md:p-8 overflow-hidden">
                        {isSubmittingPassword && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm transition-all">
                                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
                                <span className="text-sm font-semibold tracking-widest text-white uppercase">Đang xử lý mật khẩu...</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    <Key className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Bảo mật & Đăng nhập</h2>
                            </div>
                        </div>

                        {/* Status explanation */}
                        <div className="pt-6">
                            {checkingAuth ? (
                                <div className="py-6 text-center text-white/40 flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Đang kiểm tra phương thức bảo mật...</span>
                                </div>
                            ) : !hasPassword ? (
                                <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
                                        <span>Tài khoản Google (Chưa có mật khẩu)</span>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">
                                        Tài khoản của bạn được tạo thông qua Đăng nhập Google. Để có thể đăng nhập trực tiếp bằng tài khoản Admin (Email + Mật khẩu), hãy tạo mật khẩu mới dưới đây.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3 mb-6">
                                    <Lock className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                    <p className="text-xs text-teal-200">
                                        Tài khoản của bạn đã được bảo vệ bằng mật khẩu. Nhập mật khẩu hiện tại để thay đổi mật khẩu mới.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                {hasPassword && (
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                            Mật khẩu hiện tại
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required={Boolean(hasPassword)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm outline-none transition-colors focus:border-yellow-400/60"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                        {hasPassword ? "Mật khẩu mới" : "Tạo mật khẩu cho tài khoản"}
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="Ít nhất 6 ký tự"
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm outline-none transition-colors focus:border-yellow-400/60"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm outline-none transition-colors focus:border-yellow-400/60"
                                    />
                                </div>

                                {/* Alerts */}
                                {passwordError && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                                        <span>{passwordError}</span>
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                                        <span>{passwordSuccess}</span>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingPassword || checkingAuth}
                                        className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm shadow-lg shadow-yellow-400/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                    >
                                        {isSubmittingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <span>{hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu mới"}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

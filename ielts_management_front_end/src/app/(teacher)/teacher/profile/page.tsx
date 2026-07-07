"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    User,
    Award,
    BookOpen,
    Save,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Globe,
    Eye,
    Loader2,
    Star,
    Camera,
    Upload
} from "lucide-react";
import { teacherProfileService, TeacherProfileResponse } from "@/services/teacherProfileService";
import { uploadService } from "@/services/uploadService";
import { useAuthContext } from "@/context/AuthContext";

const Facebook = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const Linkedin = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
);
const Youtube = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /></svg>
);

export default function TeacherProfilePage() {
    const { updateProfile } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [title, setTitle] = useState("");
    const [band, setBand] = useState("");
    const [experienceYears, setExperienceYears] = useState<number>(3);
    const [bio, setBio] = useState("");
    const [teachingPhilosophy, setTeachingPhilosophy] = useState("");
    const [isFeatured, setIsFeatured] = useState(true);

    // Dynamic lists
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState("");

    const [certificates, setCertificates] = useState<string[]>([]);
    const [newCertificate, setNewCertificate] = useState("");

    // Socials
    const [facebook, setFacebook] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [youtube, setYoutube] = useState("");
    const [website, setWebsite] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const res = await teacherProfileService.getMyProfile();
        if (res.success && res.data) {
            const { user, profile } = res.data;
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setAvatar(user.avatar || "");

            setTitle(profile.title || "");
            setBand(profile.band || "8.0");
            setExperienceYears(profile.experienceYears || 0);
            setBio(profile.bio || "");
            setTeachingPhilosophy(profile.teachingPhilosophy || "");
            setIsFeatured(profile.isFeatured ?? true);

            setHighlights(profile.highlights || []);
            setCertificates(profile.certificates || []);

            setFacebook(profile.socialLinks?.facebook || "");
            setLinkedin(profile.socialLinks?.linkedin || "");
            setYoutube(profile.socialLinks?.youtube || "");
            setWebsite(profile.socialLinks?.website || "");
        } else {
            showToast("error", res.message || "Không thể tải hồ sơ");
        }
        setLoading(false);
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAddHighlight = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
            setHighlights([...highlights, newHighlight.trim()]);
            setNewHighlight("");
        }
    };

    const handleRemoveHighlight = (idx: number) => {
        setHighlights(highlights.filter((_, i) => i !== idx));
    };

    const handleAddCertificate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCertificate.trim() && !certificates.includes(newCertificate.trim())) {
            setCertificates([...certificates, newCertificate.trim()]);
            setNewCertificate("");
        }
    };

    const handleRemoveCertificate = (idx: number) => {
        setCertificates(certificates.filter((_, i) => i !== idx));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const signatureResponse = await uploadService.requestSignature({
                resourceType: "image",
                folder: "avatars",
            });

            if (signatureResponse.status !== "success" || !signatureResponse.data) {
                throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload");
            }

            const uploaded = await uploadService.uploadToCloudinary(file, signatureResponse.data);
            setAvatar(uploaded.secure_url);
            try {
                await updateProfile({ name, avatar: uploaded.secure_url });
            } catch (err) {
                console.warn("Lỗi đồng bộ header:", err);
            }
            showToast("success", "Tải ảnh đại diện lên và đồng bộ lên Header thành công!");
        } catch (error: any) {
            showToast("error", error?.message || "Lỗi khi tải ảnh lên Cloudinary");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            name,
            avatar,
            phone,
            title,
            band,
            experienceYears: Number(experienceYears),
            bio,
            teachingPhilosophy,
            highlights,
            certificates,
            socialLinks: {
                facebook,
                linkedin,
                youtube,
                website
            },
            isFeatured
        };

        const res = await teacherProfileService.updateMyProfile(payload);
        if (res.success) {
            try {
                await updateProfile({ name, avatar });
            } catch (err) {
                console.warn("Lỗi đồng bộ header:", err);
            }
            showToast("success", "Đã lưu và đồng bộ hồ sơ giảng viên vào hệ thống & AI thành công!");
        } else {
            showToast("error", res.message || "Lỗi khi cập nhật hồ sơ");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#1c7c78]" />
                <p className="text-sm font-medium text-gray-600">Đang tải dữ liệu hồ sơ chuyên môn...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-2xl border border-gray-100 animate-slide-in-up">
                    {toast.type === "success" ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-gray-800">{toast.message}</span>
                </div>
            )}

            {/* Header Bar */}
            <div className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-md px-6 py-4 shadow-2xs">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            Quản Lý Hồ Sơ Giảng Viên (Teacher Profile)
                        </h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c7c78] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1c7c78]/25 hover:bg-[#166360] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang đồng bộ...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Lưu Hồ Sơ</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-8 items-start">

                    {/* LEFT COLUMN: EDIT FORM */}
                    <div className="space-y-6">

                        {/* Card 1: Basic Info */}
                        <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <User className="h-5 w-5 text-[#1c7c78]" />
                                Thông Tin Cơ Bản
                            </h2>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                <div className="relative group">
                                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#1c7c78]/20 shrink-0 bg-gray-100 shadow-sm">
                                        {avatar ? (
                                            <Image src={avatar} alt={name} fill className="object-cover" sizes="80px" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <User className="h-8 w-8" />
                                            </div>
                                        )}
                                        {uploadingAvatar && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 transition-all">
                                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="teacher-avatar-upload"
                                        className={`absolute bottom-0 right-0 p-1.5 rounded-full bg-[#1c7c78] text-white shadow-md cursor-pointer hover:bg-[#15615e] transition-all active:scale-95 ${uploadingAvatar ? "pointer-events-none opacity-50" : ""}`}
                                        title="Tải lên ảnh mới"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </label>
                                    <input
                                        id="teacher-avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-700">URL Ảnh Đại Diện (Avatar)</label>
                                        <label
                                            htmlFor="teacher-avatar-upload"
                                            className="text-xs font-bold text-[#1c7c78] hover:text-[#15615e] hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Tải ảnh lên từ máy
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        placeholder="https://example.com/my-avatar.webp hoặc bấm tải ảnh lên"
                                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Họ và tên giảng viên</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden font-medium text-gray-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Email (Đăng nhập)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Số điện thoại liên hệ</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0912345678"
                                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-4 px-2">
                                    <div>
                                        <span className="text-xs font-bold text-gray-800 block">Hiển thị trên Trang chủ</span>
                                        <span className="text-[11px] text-gray-500">Cho phép học viên thấy bạn ở khối Teacher Showcase</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="h-5 w-5 rounded-md border-gray-300 text-[#1c7c78] focus:ring-[#1c7c78] cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Chức danh & IELTS Band */}
                        <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Award className="h-5 w-5 text-[#1c7c78]" />
                                Chức Danh & Trình Độ Chuyên Môn
                            </h2>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Chức danh / Tiêu đề chuyên môn</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Thạc sĩ Kinh tế đối ngoại - ĐH Ngoại Thương | Certified CELTA"
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Điểm IELTS Overall Band</label>
                                    <input
                                        type="text"
                                        value={band}
                                        onChange={(e) => setBand(e.target.value)}
                                        placeholder="Ví dụ: 8.5"
                                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden font-bold text-[#1c7c78]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Số năm kinh nghiệm giảng dạy</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={50}
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Giới thiệu & Triết lý */}
                        <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <BookOpen className="h-5 w-5 text-[#1c7c78]" />
                                Giới Thiệu & Triết Lý Giảng Dạy
                            </h2>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Giới thiệu ngắn (Bio)</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Đoạn giới thiệu về phong cách, mục tiêu và cam kết giảng dạy của bạn..."
                                    className="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:border-[#1c7c78] focus:outline-hidden leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Triết lý giảng dạy (Teaching Philosophy)</label>
                                <textarea
                                    rows={2}
                                    value={teachingPhilosophy}
                                    onChange={(e) => setTeachingPhilosophy(e.target.value)}
                                    placeholder="Chia sẻ quan điểm, triết lý sư phạm tạo động lực học tập cho học viên..."
                                    className="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:border-[#1c7c78] focus:outline-hidden leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Card 4: Highlights & Certificates */}
                        <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs space-y-6">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Star className="h-5 w-5 text-[#1c7c78]" />
                                Điểm Nổi Bật & Bằng Cấp Chứng Chỉ
                            </h2>

                            {/* Highlights List */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Điểm nổi bật giảng dạy (Highlights)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {highlights.map((h, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1.5 text-xs font-medium"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            {h}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHighlight(i)}
                                                className="text-emerald-600 hover:text-emerald-900 ml-1"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <form onSubmit={handleAddHighlight} className="flex gap-2 pt-1">
                                    <input
                                        type="text"
                                        value={newHighlight}
                                        onChange={(e) => setNewHighlight(e.target.value)}
                                        placeholder="Thêm điểm nổi bật (ví dụ: Chuyên môn hóa Writing Task 2)..."
                                        className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-xs font-semibold transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm
                                    </button>
                                </form>
                            </div>

                            {/* Certificates List */}
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Bằng cấp & Chứng chỉ chuyên môn (Certificates)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {certificates.map((c, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60 px-3 py-1.5 text-xs font-medium"
                                        >
                                            <Award className="h-3.5 w-3.5 text-blue-600" />
                                            {c}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCertificate(i)}
                                                className="text-blue-600 hover:text-blue-900 ml-1"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <form onSubmit={handleAddCertificate} className="flex gap-2 pt-1">
                                    <input
                                        type="text"
                                        value={newCertificate}
                                        onChange={(e) => setNewCertificate(e.target.value)}
                                        placeholder="Thêm chứng chỉ (ví dụ: CELTA by Cambridge)..."
                                        className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-xs font-semibold transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Card 5: Socials */}
                        <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Globe className="h-5 w-5 text-[#1c7c78]" />
                                Mạng Xã Hội & Website
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Facebook className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-600" />
                                    <input
                                        type="text"
                                        value={facebook}
                                        onChange={(e) => setFacebook(e.target.value)}
                                        placeholder="Link Facebook cá nhân / fanpage"
                                        className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                                <div className="relative">
                                    <Linkedin className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-700" />
                                    <input
                                        type="text"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="Link LinkedIn Profile"
                                        className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                                <div className="relative">
                                    <Youtube className="absolute left-3.5 top-2.5 h-4 w-4 text-red-600" />
                                    <input
                                        type="text"
                                        value={youtube}
                                        onChange={(e) => setYoutube(e.target.value)}
                                        placeholder="Link Kênh YouTube"
                                        className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                                <div className="relative">
                                    <Globe className="absolute left-3.5 top-2.5 h-4 w-4 text-emerald-600" />
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="Website cá nhân / Blog"
                                        className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2 text-sm focus:border-[#1c7c78] focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW CARD */}
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4 text-[#1c7c78]" />
                                Live Preview (Khối hiển thị Trang Chủ)
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Thời gian thực
                            </span>
                        </div>

                        {/* Showcase Card Mock */}
                        <div className="rounded-3xl bg-white border border-gray-200/90 shadow-xl overflow-hidden p-7 space-y-6 relative">

                            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#1c7c78]/10 blur-2xl pointer-events-none" />

                            {/* Badges */}
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center rounded-full bg-[#1c7c78] text-white px-4 py-1 text-xs tracking-[0.15em] uppercase font-bold shadow-xs">
                                    IELTS {band || "8.0"}
                                </span>
                                <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">
                                    {experienceYears} Năm Kinh Nghiệm
                                </span>
                            </div>

                            {/* Teacher Identity */}
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#1c7c78] shadow-md shrink-0 bg-gray-100">
                                    {avatar ? (
                                        <Image src={avatar} alt={name} fill className="object-cover object-top" sizes="64px" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            <User className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-2xl font-bold text-gray-900 truncate">
                                        {name || "Họ Tên Giảng Viên"}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 line-clamp-2 mt-0.5">
                                        {title || "Chức danh chuyên môn chưa cập nhật"}
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-sm text-gray-600 leading-relaxed italic bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                                &ldquo;{bio || "Chưa có lời giới thiệu ngắn nào từ giảng viên."}&rdquo;
                            </p>

                            {/* Highlights */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Điểm Nổi Bật Giảng Dạy:
                                </h4>
                                <ul className="space-y-2 text-xs text-gray-600">
                                    {highlights.length > 0 ? (
                                        highlights.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <span className="mt-1 h-2 w-2 rounded-full bg-[#ef4444] shrink-0" />
                                                <span className="font-medium">{item}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400 italic">Chưa có điểm nổi bật nào được thêm.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Certificates */}
                            {certificates.length > 0 && (
                                <div className="space-y-2 pt-3 border-t border-gray-100">
                                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        Chứng chỉ xác thực:
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {certificates.map((cert, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700"
                                            >
                                                <Award className="h-3 w-3 text-[#1c7c78]" />
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social Link preview */}
                            {(facebook || linkedin || youtube || website) && (
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    {facebook && (
                                        <a href={facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:scale-110 transition-transform">
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    )}
                                    {linkedin && (
                                        <a href={linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:scale-110 transition-transform">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                    )}
                                    {youtube && (
                                        <a href={youtube} target="_blank" rel="noreferrer" className="text-red-600 hover:scale-110 transition-transform">
                                            <Youtube className="h-4 w-4" />
                                        </a>
                                    )}
                                    {website && (
                                        <a href={website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:scale-110 transition-transform">
                                            <Globe className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Teaching Philosophy Preview */}
                        {teachingPhilosophy && (
                            <div className="rounded-2xl bg-[#1c7c78]/5 border border-[#1c7c78]/20 p-5 space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1c7c78] flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Triết lý giảng dạy
                                </span>
                                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                    {teachingPhilosophy}
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

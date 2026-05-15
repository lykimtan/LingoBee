"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { UpdateProfilePayload } from "@/services/authService";
import { uploadService } from "@/services/uploadService";
import Loader from "@/components/Loader";
import { Navigation } from "@/components/Navigation";

const formatDateTime = (value: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("vi-VN", {
		dateStyle: "long",
		timeStyle: "short",
	}).format(date);
};

export default function EditProfilePage() {
	const router = useRouter();
	const { user, isLoading, updateProfile } = useAuthContext();
	const [displayName, setDisplayName] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!user) {
			return;
		}

		setDisplayName(user.name);
		setAvatarPreview(user.avatar || null);
	}, [user]);

	useEffect(() => {
		return () => {
			if (avatarPreview && avatarPreview.startsWith("blob:")) {
				URL.revokeObjectURL(avatarPreview);
			}
		};
	}, [avatarPreview]);

	const createdAtLabel = useMemo(() => {
		if (!user?.createdAt) {
			return "-";
		}

		return formatDateTime(user.createdAt);
	}, [user?.createdAt]);

	if (isLoading && !user) {
		return <Loader />;
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-[#0c0c0d] flex items-center justify-center px-6 text-center">
				<div>
					<h1 className="text-2xl font-semibold text-white mb-3">Bạn cần đăng nhập</h1>
					<p className="text-white/60 mb-6">Hãy đăng nhập để chỉnh sửa hồ sơ cá nhân.</p>
					<Link
						href="/login"
						className="inline-flex rounded-full bg-[#f4e900] px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
					>
						Đi tới đăng nhập
					</Link>
				</div>
			</div>
		);
	}

	const isGoogleAccount = Boolean(user.googleId);

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		setErrorMessage(null);
		setSuccessMessage(null);

		if (!file) {
			setSelectedAvatar(null);
			setAvatarPreview(user.avatar || null);
			return;
		}

		if (avatarPreview && avatarPreview.startsWith("blob:")) {
			URL.revokeObjectURL(avatarPreview);
		}

		setSelectedAvatar(file);
		setAvatarPreview(URL.createObjectURL(file));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);
		setIsSubmitting(true);

		try {
			let avatarUrl = user.avatar || "";

			if (selectedAvatar) {
				const signatureResponse = await uploadService.requestSignature({
					resourceType: "image",
					folder: "avatars",
				});

				if (signatureResponse.status !== "success" || !signatureResponse.data) {
					throw new Error(signatureResponse.message || "Không thể tạo chữ ký upload avatar");
				}

				const uploadedAvatar = await uploadService.uploadToCloudinary(
					selectedAvatar,
					signatureResponse.data
				);

				avatarUrl = uploadedAvatar.secure_url;
			}

			const payload: UpdateProfilePayload = {
				name: displayName.trim(),
				...(avatarUrl ? { avatar: avatarUrl } : {}),
			};

			const response = (await updateProfile(payload)) as
				| { status?: string; message?: string }
				| undefined;

			if (!response || response.status !== "success") {
				throw new Error((response as { message?: string } | undefined)?.message || "Cập nhật hồ sơ thất bại");
			}

			setSelectedAvatar(null);
			setSuccessMessage("Đã cập nhật hồ sơ thành công.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen  text-white relative overflow-hidden">
			<Navigation />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,233,0,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
			<main className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
				<div className="text-center mb-8 mt-8">
					<p className="text-sm text-white/70 uppercase tracking-[0.35em]">Cài đặt tài khoản cá nhân</p>
					<h1 className="mt-3 text-3xl md:text-4xl font-semibold">Quản lý hồ sơ người dùng</h1>
					<p className="mt-3 text-white/60">Chỉ avatar và tên hiển thị có thể chỉnh sửa. Email và thời gian tạo tài khoản chỉ xem.</p>
				</div>

				<section className="relative rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)] p-6 md:p-10">
					{isSubmitting && (
						<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[28px] bg-black/50">
							<Image
								src="/profile/loading.gif"
								alt="Loading"
								width={140}
								height={140}
								unoptimized
							/>
							<p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
								Đang lưu
							</p>
						</div>
					)}
					<div className="flex flex-col items-center mb-10">
						<div className="relative group">
							<div className="relative h-32 w-32 rounded-full p-[3px] bg-gradient-to-br from-[#f4e900] via-[#c8a64a] to-[#2f2f2f] shadow-[0_0_40px_rgba(244,233,0,0.18)]">
								<div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-[#161617]">
									<Image
										src={avatarPreview || "/default_images/avatar.jpg"}
										alt={user.name}
										fill
										unoptimized
										className="object-cover"
									/>
								</div>
							</div>
							<label
								htmlFor="avatar-upload"
								className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f4e900] text-black shadow-lg transition-transform hover:scale-105"
							>
								<span className="text-lg font-bold">+</span>
							</label>
							<input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
						</div>
						<p className="mt-4 text-sm text-white/60">Nhấn vào dấu cộng để đổi avatar.</p>
					</div>

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<label className="space-y-2">
								<span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Tên hiển thị</span>
								<input
									value={displayName}
									onChange={(event) => setDisplayName(event.target.value)}
									className="w-full rounded-2xl border border-white/10 bg-[#1b1b1d] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#f4e900]/60"
									placeholder="Tên của bạn"
								/>
							</label>

							<label className="space-y-2">
								<span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Email</span>
								<input
									value={user.email}
									readOnly
									className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white/60 outline-none cursor-not-allowed"
								/>
							</label>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Thời gian tạo tài khoản</span>
								<div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white/60">
									{createdAtLabel}
								</div>
							</div>

							<div className="space-y-2">
								<span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Avatar hiện tại</span>
								<div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white/60 truncate">
									{user.avatar || "Chưa có avatar"}
								</div>
							</div>
						</div>

						{errorMessage && (
							<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								{errorMessage}
							</div>
						)}

						{successMessage && (
							<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
								{successMessage}
							</div>
						)}

						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-4">
							{isGoogleAccount ? (
								<button
									type="button"
									disabled
									className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/60 cursor-not-allowed"
								>
									Đổi mật khẩu
								</button>
							) : (
								<Link
									href="/profile/change-password"
									className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
								>
									Đổi mật khẩu
								</Link>
							)}

							<div className="flex flex-col gap-3 md:flex-row">
								<button
									type="button"
									onClick={() => router.push("/profile")}
									className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
								>
									Hủy
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center justify-center rounded-2xl bg-[#f4e900] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
								</button>
							</div>
						</div>
					</form>
				</section>
			</main>
		</div>
	);
}

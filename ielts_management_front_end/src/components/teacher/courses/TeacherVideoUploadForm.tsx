"use client";

import { useState, useRef } from "react";
import { apiClient } from "@/utils/api";
import { uploadService } from "@/services/uploadService";
import Loader from "@/components/teacher/Loader";
import { CloudUpload, Clapperboard, ArrowUpFromLine, ImageIcon } from "lucide-react";
import { CourseVideo } from "./TeacherVideoList";

interface TeacherVideoUploadFormProps {
  courseId: string;
  onUploadSuccess: (video: CourseVideo) => void;
}

export default function TeacherVideoUploadForm({ courseId, onUploadSuccess }: TeacherVideoUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isMandatory, setIsMandatory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề video.");
      return;
    }
    if (!file) {
      setError("Vui lòng chọn video để upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const signatureResponse = await uploadService.requestSignature({
        resourceType: "video",
        folder: "videos",
      });

      if (signatureResponse.status === "error" || !signatureResponse.data) {
        throw new Error(signatureResponse.message || "Không thể lấy chữ ký upload.");
      }

      const uploaded = await uploadService.uploadToCloudinary(file, signatureResponse.data);

      let thumbnailUrl = "";
      if (thumbnailFile) {
        const thumbnailSignature = await uploadService.requestSignature({
          resourceType: "image",
          folder: "thumbnails",
        });

        if (thumbnailSignature.status === "error" || !thumbnailSignature.data) {
          throw new Error(thumbnailSignature.message || "Khong the lay chu ky upload thumbnail.");
        }

        const thumbnailUpload = await uploadService.uploadToCloudinary(
          thumbnailFile,
          thumbnailSignature.data
        );
        thumbnailUrl = thumbnailUpload.secure_url || "";
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration: Math.round(uploaded.duration ?? 0),
        videoUrl: uploaded.secure_url,
        thumbnailUrl,
        isPublished,
        isMandatory,
      };

      const createResponse = await apiClient.post<CourseVideo>(`/api/videos/course/${courseId}`, payload);

      if (createResponse.status === "error" || !createResponse.data) {
        throw new Error(createResponse.message || "Không thể tạo video.");
      }

      onUploadSuccess(createResponse.data);

      setTitle("");
      setDescription("");
      setFile(null);
      setThumbnailFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
      setIsPublished(false);
      setIsMandatory(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload thất bại.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {isSubmitting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/50 backdrop-blur-md">
          <Loader />
        </div>
      )}

      <div className="flex items-center gap-3">
        <CloudUpload className="h-7 w-7 text-gray-900" />
        <h2 className="text-2xl font-bold text-gray-900">Upload video mới</h2>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tiêu đề</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400"
            placeholder="Nhập tiêu đề video..."
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Mô tả (Không bắt buộc)</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-gray-400"
            rows={4}
            placeholder="Nhập mô tả chi tiết cho video này..."
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Video File</label>
          <div
            className={`relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 transition-colors hover:bg-gray-50 ${file ? "border-[#1f6f5e]/30 bg-[#1f6f5e]/5" : "border-gray-300 bg-gray-50/50"
              }`}
          >
            <Clapperboard className="mb-4 h-8 w-8 text-gray-700" />
            <p className="text-center text-sm font-medium text-gray-900">
              <span className="font-bold">Kéo thả</span> hoặc click để chọn file
            </p>
            <p className="mt-1 text-center text-xs font-medium text-gray-500">
              MP4, MOV hoặc MKV (Tối đa 500MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            {file && (
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1f6f5e] shadow-sm">
                  {file.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Thumbnail (Khong bat buoc)</label>
          <div
            className={`relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 transition-colors hover:bg-gray-50 ${
              thumbnailFile
                ? "border-[#1f6f5e]/30 bg-[#1f6f5e]/5"
                : "border-gray-300 bg-gray-50/50"
            }`}
          >
            <ImageIcon className="mb-3 h-7 w-7 text-gray-700" />
            <p className="text-center text-sm font-medium text-gray-900">
              <span className="font-bold">Chon anh</span> de lam thumbnail
            </p>
            <p className="mt-1 text-center text-xs font-medium text-gray-500">
              JPG, PNG, WEBP (Toi da 5MB)
            </p>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            {thumbnailFile && (
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1f6f5e] shadow-sm">
                  {thumbnailFile.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-8 pt-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm font-semibold text-gray-800">Xuất bản ngay</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(event) => setIsMandatory(event.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm font-semibold text-gray-800">Bắt buộc học</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={isSubmitting}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-base font-bold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowUpFromLine className="h-5 w-5" />
          {isSubmitting ? "Đang upload..." : "Upload video"}
        </button>
      </div>
    </section>
  );
}

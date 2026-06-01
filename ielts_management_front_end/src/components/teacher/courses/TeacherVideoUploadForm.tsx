"use client";

import { useEffect, useState } from "react";
import { uploadService } from "@/services/uploadService";
import { videoService } from "@/services/videoService";
import Loader from "@/components/teacher/Loader";
import { CloudUpload, ArrowUpFromLine } from "lucide-react";
import { toast } from "react-toastify";
import { CourseVideo } from "@/types";
import Image from "next/image";
import RichTextEditor  from "@/components/teacher/RichTextEditor";

import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import vi_VN from '@uppy/locales/lib/vi_VN';


import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

interface TeacherVideoUploadFormProps {
  courseId: string;
  onUploadSuccess: (video: CourseVideo) => void;
  initialVideo?: CourseVideo | null;
  onUpdateSuccess?: (video: CourseVideo) => void;
  onCancelEdit?: () => void;
}

export default function TeacherVideoUploadForm({
  courseId,
  onUploadSuccess,
  initialVideo,
  onUpdateSuccess,
  onCancelEdit,
}: TeacherVideoUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isMandatory, setIsMandatory] = useState(true);
  const isEditing = Boolean(initialVideo?._id);

  const [uppy, setUppy] = useState<any>(null);
  useEffect(() => {
    const u = new Uppy({
      locale: vi_VN,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['video/*'],
        maxFileSize: 1000 * 1024 * 1024, // 1GB
      },
      autoProceed: false,
    });

    u.addUploader(async (fileIDs) => {
      for (const fileID of fileIDs) {
        const file = u.getFile(fileID);

        try {
          // 1. Get Signature
          const signatureResponse = await uploadService.requestSignature({
            resourceType: "video",
            folder: "videos",
          });

          if (signatureResponse.status === "error" || !signatureResponse.data) {
            throw new Error(signatureResponse.message || "Không thể lấy chữ ký upload video.");
          }

          const sigData = signatureResponse.data;

          // 2. Prepare FormData
          const formData = new FormData();
          formData.append('file', file.data as Blob);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', String(sigData.timestamp));
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);
          if (sigData.uploadPreset) {
            formData.append('upload_preset', sigData.uploadPreset);
          }


          // 3. Upload with XMLHttpRequest for progress tracking
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const currentFile = u.getFile(fileID);
                u.setFileState(fileID, {
                  progress: {
                    ...currentFile.progress,
                    uploadStarted: currentFile.progress?.uploadStarted ?? Date.now(),
                    bytesUploaded: event.loaded,
                    bytesTotal: event.total,
                    percentage: Math.round((event.loaded / event.total) * 100)
                  }
                });

                u.emit('upload-progress', currentFile, {
                  uploadStarted: currentFile.progress?.uploadStarted ?? Date.now(),
                  bytesUploaded: event.loaded,
                  bytesTotal: event.total,
                });
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                u.setFileState(fileID, {
                  response: { status: xhr.status, body: response, uploadURL: response.secure_url }
                });
                u.emit('upload-success', file, { status: xhr.status, body: response, uploadURL: response.secure_url });
                resolve(response);
              } else {
                let errorMsg = `Lỗi Cloudinary (${xhr.status})`;
                try {
                  const payload = JSON.parse(xhr.responseText);
                  if (payload?.error?.message) errorMsg = payload.error.message;
                  //eslint-disable-next-line
                } catch (e) { }
                const err = new Error(errorMsg);
                u.emit('upload-error', file, err);
                reject(err);
              }
            };

            xhr.onerror = () => {
              const err = new Error('Network error trong quá trình upload video.');
              u.emit('upload-error', file, err);
              reject(err);
            };

            xhr.send(formData);
          });

        } catch (err) {
          u.emit('upload-error', file, err instanceof Error ? err : new Error('Upload failed'));
          throw err;
        }
      }
    });

    setUppy(u);

    return () => u.destroy();
  }, []);

  const [uppyThumbnail, setUppyThumbnail] = useState<any>(null);
  useEffect(() => {
    const u = new Uppy({
      id: 'uppyThumbnail',
      locale: vi_VN,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
      },
      autoProceed: false,
    });

    // Custom Cloudinary Uploader for Thumbnail
    u.addUploader(async (fileIDs) => {
      for (const fileID of fileIDs) {
        const file = u.getFile(fileID);

        try {
          // 1. Get Signature
          const signatureResponse = await uploadService.requestSignature({
            resourceType: "image",
            folder: "thumbnails",
          });

          if (signatureResponse.status === "error" || !signatureResponse.data) {
            throw new Error(signatureResponse.message || "Không thể lấy chữ ký upload thumbnail.");
          }

          const sigData = signatureResponse.data;

          // 2. Prepare FormData
          const formData = new FormData();
          formData.append('file', file.data as Blob);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', String(sigData.timestamp));
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);
          if (sigData.uploadPreset) {
            formData.append('upload_preset', sigData.uploadPreset);
          }

          // 3. Upload with XMLHttpRequest for progress tracking
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const currentFile = u.getFile(fileID);
                u.setFileState(fileID, {
                  progress: {
                    ...currentFile.progress,
                    uploadStarted: currentFile.progress?.uploadStarted ?? Date.now(),
                    bytesUploaded: event.loaded,
                    bytesTotal: event.total,
                    percentage: Math.round((event.loaded / event.total) * 100)
                  }
                });

                u.emit('upload-progress', currentFile, {
                  uploadStarted: currentFile.progress?.uploadStarted ?? Date.now(),
                  bytesUploaded: event.loaded,
                  bytesTotal: event.total,
                });
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                u.setFileState(fileID, {
                  response: { status: xhr.status, body: response, uploadURL: response.secure_url }
                });
                u.emit('upload-success', file, { status: xhr.status, body: response, uploadURL: response.secure_url });
                resolve(response);
              } else {
                let errorMsg = `Lỗi Cloudinary (${xhr.status})`;
                try {
                  const payload = JSON.parse(xhr.responseText);
                  if (payload?.error?.message) errorMsg = payload.error.message;
                } catch { }
                const err = new Error(errorMsg);
                u.emit('upload-error', file, err);
                reject(err);
              }
            };

            xhr.onerror = () => {
              const err = new Error('Network error trong quá trình upload thumbnail.');
              u.emit('upload-error', file, err);
              reject(err);
            };

            xhr.send(formData);
          });

        } catch (err) {
          u.emit('upload-error', file, err instanceof Error ? err : new Error('Upload thumbnail failed'));
          throw err;
        }
      }
    });

    setUppyThumbnail(u);

    return () => u.destroy();
  }, []);

  useEffect(() => {
    if (initialVideo) {
      setTitle(initialVideo.title || "");
      setDescription(initialVideo.description || "");
      setIsPublished(Boolean(initialVideo.isPublished));
      setIsMandatory(initialVideo.isMandatory !== false);
      setError(null);
      uppy?.cancelAll();
      uppyThumbnail?.cancelAll();
      return;
    }

    setTitle("");
    setDescription("");
    setIsPublished(false);
    setIsMandatory(true);
    setError(null);
    uppy?.cancelAll();
    uppyThumbnail?.cancelAll();
  }, [initialVideo, uppy, uppyThumbnail]);

  const handleUpload = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề video.");
      return;
    }

    if (!uppy || !uppyThumbnail) return;
    const files = uppy.getFiles();
    if (!isEditing && files.length === 0) {
      setError("Vui lòng chọn video để upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let secureUrl: string | undefined;
      let duration: number | undefined;

      if (files.length > 0) {
        // 1. Start Uppy Upload
        const result = await uppy.upload();

        if (!result) {
          throw new Error("Quá trình upload đã bị hủy hoặc không thể bắt đầu.");
        }

        if (result.failed && result.failed.length > 0) {
          const errorMsg = result.failed[0].error || "Upload video thất bại.";
          throw new Error(String(errorMsg));
        }

        if (!result.successful || result.successful.length === 0) {
          throw new Error("Không có video nào được upload thành công.");
        }

        const uploadedVideo = result.successful[0];
        // eslint-disable-next-line 
        const responseBody = uploadedVideo.response?.body as any;
        secureUrl = responseBody?.secure_url;
        duration = responseBody?.duration || 0;

        if (!secureUrl) {
          throw new Error("Không lấy được đường dẫn video từ Cloudinary.");
        }
      }

      // 4. Upload Thumbnail via Uppy
      let thumbnailUrl: string | undefined;
      const thumbFiles = uppyThumbnail.getFiles();
      if (thumbFiles.length > 0) {
        const thumbResult = await uppyThumbnail.upload();

        if (!thumbResult) {
          throw new Error("Quá trình upload thumbnail đã bị hủy.");
        }

        if (thumbResult.failed && thumbResult.failed.length > 0) {
          const errorMsg = thumbResult.failed[0].error || "Upload thumbnail thất bại.";
          throw new Error(String(errorMsg));
        }

        if (thumbResult.successful && thumbResult.successful.length > 0) {
          const uploadedThumb = thumbResult.successful[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const responseBody = uploadedThumb.response?.body as any;
          thumbnailUrl = responseBody?.secure_url || "";
        }
      }

      // 5. Save to Database
      const payload: Partial<CourseVideo> = {
        title: title.trim(),
        description: description.trim(),
        isPublished,
        isMandatory,
      };

      if (typeof duration === "number") {
        payload.duration = Math.round(duration);
      }

      if (secureUrl) {
        payload.videoUrl = secureUrl;
      }

      if (thumbnailUrl) {
        payload.thumbnailUrl = thumbnailUrl;
      }

      if (isEditing && initialVideo?._id) {
        const updateResponse = await videoService.updateVideo(initialVideo._id, payload);

        if (updateResponse.status === "error" || !updateResponse.data) {
          throw new Error(updateResponse.message || "Không thể cập nhật video.");
        }

        onUpdateSuccess?.(updateResponse.data);
        toast.success("Cập nhật video thành công!");
        onCancelEdit?.();
      } else {
        const createResponse = await videoService.createVideoByCourse(courseId,payload);

        if (createResponse.status === "error" || !createResponse.data) {
          throw new Error(createResponse.message || "Không thể tạo video.");
        }

        onUploadSuccess(createResponse.data);
        toast.success("Tải lên video thành công!");
      }

      // Reset form
      setTitle("");
      setDescription("");
      uppy?.cancelAll();
      uppyThumbnail?.cancelAll();
      setIsPublished(false);
      setIsMandatory(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload thất bại.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {/* Khóa UI khi đang submit nhưng không che khuất Uppy Dashboard */}
      {isSubmitting && (
        <div className="absolute inset-0 z-10 rounded-3xl bg-white/20 backdrop-blur-[1px] pointer-events-none"></div>
      )}

      <div className="flex items-center gap-3">
        <CloudUpload className="h-7 w-7 text-gray-900" />
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Cập nhật video" : "Upload video mới"}
        </h2>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {isEditing && (initialVideo?.videoUrl || initialVideo?.thumbnailUrl) && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Du lieu hien tai
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
              {initialVideo?.videoUrl && (
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-500">Video hien tai</p>
                  <video
                    src={initialVideo.videoUrl}
                    controls
                    preload="metadata"
                    className="mt-2 w-full rounded-xl"
                  />
                </div>
              )}
              {initialVideo?.thumbnailUrl && (
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                  <p className="text-xs font-semibold text-gray-500">Thumbnail hien tai</p>
                  <Image
                    src={initialVideo.thumbnailUrl}
                    alt={initialVideo.title}
                    width={320}
                    height={180}
                    className="mt-2 h-40 w-full rounded-xl object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
          <RichTextEditor
            value={description}
            onChange={setDescription}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Video File</label>
          <div className="mt-2 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
            {uppy ? (
              <Dashboard
                uppy={uppy}
                hideUploadButton={true}
                proudlyDisplayPoweredByUppy={false}
                height={300}
                width="100%"
                theme="light"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center animate-pulse text-gray-400">Đang tải...</div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Thumbnail (Không bắt buộc)</label>
          <div className="mt-2 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
            {uppyThumbnail ? (
              <Dashboard
                uppy={uppyThumbnail}
                hideUploadButton={true}
                proudlyDisplayPoweredByUppy={false}
                height={200}
                width="100%"
                theme="light"
              />
            ) : (
              <div className="h-[200px] flex items-center justify-center animate-pulse text-gray-400">Đang tải...</div>
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

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-base font-bold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
          >
            {isSubmitting ? <Loader /> : <ArrowUpFromLine className="h-5 w-5" />}
            {isSubmitting
              ? "Loading..."
              : isEditing
                ? "Update Video"
                : "Upload video"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl border border-gray-200 px-6 py-4 text-base font-bold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Hủy cập nhật
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

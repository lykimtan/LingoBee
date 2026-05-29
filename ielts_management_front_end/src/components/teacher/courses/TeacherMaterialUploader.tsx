"use client";

import { useState } from "react";
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/dashboard';
import vi_VN from '@uppy/locales/lib/vi_VN';
import { uploadService } from "@/services/uploadService";
import { toast } from "react-toastify";

import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

interface TeacherMaterialUploaderProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  maxFileSizeMB?: number;
}

export default function TeacherMaterialUploader({
  onUploadSuccess,
  maxFileSizeMB = 20,
}: TeacherMaterialUploaderProps) {
  const [uppy] = useState(() => {
    const u = new Uppy({
      id: 'uppyMaterial',
      locale: vi_VN,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['application/pdf'],
        maxFileSize: maxFileSizeMB * 1024 * 1024,
      },
      autoProceed: true, // Auto start upload when file is dropped
    });

    u.addUploader(async (fileIDs) => {
      for (const fileID of fileIDs) {
        const file = u.getFile(fileID);
        
        try {
          // 1. Lấy chữ ký từ backend
          const signatureResponse = await uploadService.requestSignature({
            resourceType: "image", // Use image so Cloudinary can process PDF pages
            folder: "materials",
          });

          if (signatureResponse.status === "error" || !signatureResponse.data) {
            throw new Error(signatureResponse.message || "Không thể lấy chữ ký upload tài liệu.");
          }

          const sigData = signatureResponse.data;

          // 2. Chuẩn bị FormData
          const formData = new FormData();
          formData.append('file', file.data as Blob);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', String(sigData.timestamp));
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);
          if (sigData.uploadPreset) {
            formData.append('upload_preset', sigData.uploadPreset);
          }

          // 3. Upload bằng XHR để Uppy có thể hiển thị tiến trình (progress)
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
                
                // Gọi callback khi thành công
                onUploadSuccess(response.secure_url, file.name || "TaiLieu.pdf");
                resolve(response);
              } else {
                let errorMsg = `Lỗi Cloudinary (${xhr.status})`;
                try {
                  const payload = JSON.parse(xhr.responseText);
                  if (payload?.error?.message) errorMsg = payload.error.message;
                } catch { /* empty */ }
                const err = new Error(errorMsg);
                u.emit('upload-error', file, err);
                reject(err);
              }
            };

            xhr.onerror = () => {
              const err = new Error('Lỗi mạng trong quá trình upload tài liệu.');
              u.emit('upload-error', file, err);
              reject(err);
            };

            xhr.send(formData);
          });

        } catch (err) {
          u.emit('upload-error', file, err instanceof Error ? err : new Error('Upload tài liệu thất bại'));
          toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra khi upload");
          throw err;
        }
      }
    });

    return u;
  });

  return (
    <div className="uppy-material-container rounded-xl overflow-hidden border border-gray-200">
      <Dashboard
        uppy={uppy}
        hideUploadButton={true} // Đã autoProceed=true nên ẩn nút upload
        proudlyDisplayPoweredByUppy={false}
        height={250}
        width="100%"
        theme="light"
        note={`Chỉ hỗ trợ file PDF (Tối đa ${maxFileSizeMB}MB)`}
      />
    </div>
  );
}

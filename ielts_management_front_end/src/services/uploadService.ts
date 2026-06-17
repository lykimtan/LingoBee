import { apiClient } from '@/utils/api';
import { ApiResponse, CloudinarySignatureResponse, CloudinaryUploadResult, UploadResourceType } from '@/types';

export interface SignatureRequestPayload {
  resourceType: UploadResourceType;
  folder?: 'avatars' | 'videos' | 'thumbnails' | 'audios' | 'materials' | 'flashcard';
}

class UploadService {
  async requestSignature(
    payload: SignatureRequestPayload
  ): Promise<ApiResponse<CloudinarySignatureResponse>> {
    return apiClient.post<CloudinarySignatureResponse>('/api/uploads/signature', payload);
  }

  async uploadToCloudinary(
    file: File,
    signatureData: CloudinarySignatureResponse
  ): Promise<CloudinaryUploadResult> {
    const { cloudName, apiKey, timestamp, signature, folder, resourceType, uploadPreset } = signatureData;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Cloudinary upload failed (${response.status})`;
      try {
        const payload = (await response.json()) as { error?: { message?: string } };
        if (payload?.error?.message) {
          errorMessage = payload.error.message;
        }
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as CloudinaryUploadResult;
  }

  async deleteUpload(url: string, resourceType: 'image' | 'video' | 'raw' = 'video') {
    if (!url) throw new Error('Missing url');
    const encoded = encodeURIComponent(url);
    return apiClient.delete(`/api/uploads?url=${encoded}&resourceType=${resourceType}`);
  }
}

export const uploadService = new UploadService();

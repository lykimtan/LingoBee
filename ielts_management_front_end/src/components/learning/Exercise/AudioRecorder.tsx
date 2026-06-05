"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import { toast } from 'react-toastify';

interface AudioRecorderProps {
  existingAudioUrl?: string | null;
  onUploadSuccess?: (url: string, publicId: string) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const MAX_RECORDING_TIME = 180; // 3 minutes in seconds

export default function AudioRecorder({
  existingAudioUrl,
  onUploadSuccess,
  onDelete,
  disabled = false
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingAudioUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(!!existingAudioUrl);
  const [publicId, setPublicId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync external changes
    if (existingAudioUrl) {
      setPreviewUrl(existingAudioUrl);
      setIsUploaded(true);
    } else {
      setPreviewUrl(null);
      setAudioBlob(null);
      setIsUploaded(false);
      setPublicId(null);
    }
  }, [existingAudioUrl]);

  // Clean up Object URL
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [previewUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setPreviewUrl(url);
        setIsUploaded(false);
        setPublicId(null);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied:", err);
      toast.error("Không thể truy cập Microphone. Vui lòng cấp quyền.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDelete = async () => {
    if (publicId && isUploaded && previewUrl) {
      try {
        await uploadService.deleteUpload(previewUrl, 'video'); // Cloudinary audio is 'video' resource type
      } catch (err) {
        console.error("Failed to delete from Cloudinary:", err);
      }
    }

    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    setIsUploaded(false);
    setPublicId(null);
    if (onDelete) onDelete();
  };

  const handleUpload = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
      // 1. Get signature
      const signatureRes = await uploadService.requestSignature({
        resourceType: 'video', // Cloudinary treats audio as video
        folder: 'audios'
      });

      if (!signatureRes.success || !signatureRes.data) {
        throw new Error("Lỗi xác thực upload");
      }

      // 2. Upload file
      const file = new File([audioBlob], `recording_${Date.now()}.mp3`, { type: 'audio/mp3' });
      const uploadResult = await uploadService.uploadToCloudinary(file, signatureRes.data);

      setIsUploaded(true);
      setPublicId(uploadResult.public_id);
      toast.success("Upload bài nói thành công!");
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadResult.secure_url, uploadResult.public_id);
      }

    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Lỗi khi upload file ghi âm");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-sm uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Bài nói (Speaking)
        </span>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400 font-medium animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Đang ghi âm... {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
          </div>
        )}
      </div>

      {!previewUrl && !isRecording && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-xl gap-4 bg-black/20">
          <button
            onClick={startRecording}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="text-center">
            <p className="text-white font-medium">Nhấn để bắt đầu ghi âm</p>
            <p className="text-white/50 text-sm mt-1">Tối đa 3 phút</p>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-red-500/30 rounded-xl gap-4 bg-red-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/40 transition-all hover:scale-105 relative z-10"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>
          <p className="text-white font-medium relative z-10">Nhấn để kết thúc</p>
        </div>
      )}

      {previewUrl && !isRecording && (
        <div className="flex flex-col gap-4">
          <audio controls className="w-full h-12 rounded-lg outline-none" src={previewUrl} />
          
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {!isUploaded && !disabled && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {isUploading ? "Đang tải lên..." : "Tải lên bản thu"}
              </button>
            )}

            {isUploaded && (
              <div className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu bản thu
              </div>
            )}

            {!disabled && (
              <button
                onClick={handleDelete}
                disabled={isUploading}
                className="px-4 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Thu âm lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

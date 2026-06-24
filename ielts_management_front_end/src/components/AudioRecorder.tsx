"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Play, Pause, Trash2 } from "lucide-react";
import { uploadService } from "@/services/uploadService";
import { toast } from "react-toastify";

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  initialAudioUrl?: string | null;
  maxDurationSeconds?: number;
}

export function AudioRecorder({ 
  onRecordingComplete, 
  initialAudioUrl,
  maxDurationSeconds = 45
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Release mic stream
        stream.getTracks().forEach(track => track.stop());
        
        await handleUpload(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      toast.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền trình duyệt.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleUpload = async (blob: Blob) => {
    setIsUploading(true);
    try {
      // Cloudinary usually expects a File object
      const file = new File([blob], "recording.webm", { type: "audio/webm" });
      
      const signatureResponse = await uploadService.requestSignature({
        resourceType: 'video', // Audio uses 'video'
        folder: 'audios'
      });

      if (signatureResponse.status === 'success' && signatureResponse.data) {
        const uploadResult = await uploadService.uploadToCloudinary(file, signatureResponse.data);
        setAudioUrl(uploadResult.secure_url);
        onRecordingComplete(uploadResult.secure_url);
        toast.success("Đã lưu bản ghi âm");
      }
    } catch (error) {
      toast.error("Lỗi khi tải file ghi âm lên hệ thống");
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onRecordingComplete("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center">
      
      {/* Recording State */}
      {!audioUrl && !isUploading && (
        <div className="flex flex-col items-center gap-4">
          <div className={`text-2xl font-mono font-bold ${isRecording ? "text-red-500" : "text-gray-700"}`}>
            {formatTime(recordingTime)} / {formatTime(maxDurationSeconds)}
          </div>
          
          {isRecording ? (
            <button 
              onClick={stopRecording}
              className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          ) : (
            <button 
              onClick={startRecording}
              className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}
          <p className="text-sm text-gray-500">
            {isRecording ? "Đang ghi âm... Bấm để dừng" : "Bấm để bắt đầu ghi âm"}
          </p>
        </div>
      )}

      {/* Uploading State */}
      {isUploading && (
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Đang xử lý file ghi âm...</p>
        </div>
      )}

      {/* Finished State */}
      {audioUrl && !isUploading && (
        <div className="flex flex-col w-full gap-4">
          <audio 
            ref={audioPlayerRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            className="hidden" 
          />
          
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={togglePlayback}
                className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">Bản ghi âm của bạn</p>
                <p className="text-xs text-gray-500">{formatTime(recordingTime || maxDurationSeconds)}</p>
              </div>
            </div>
            
            <button 
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="Xóa và ghi âm lại"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

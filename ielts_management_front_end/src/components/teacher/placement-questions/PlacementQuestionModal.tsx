"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { PlacementQuestion, PlacementDifficulty, PlacementQuestionType, PlacementOption } from "@/types";
import { uploadService } from "@/services/uploadService";
import { toast } from "react-toastify";

interface PlacementQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PlacementQuestion>) => Promise<void>;
  initialData?: PlacementQuestion | null;
  isSaving: boolean;
}

export function PlacementQuestionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: PlacementQuestionModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRendered) return;
    
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRendered]);

  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState<PlacementDifficulty>("medium");
  const [questionType, setQuestionType] = useState<PlacementQuestionType>("multipleChoice");
  const [isActive, setIsActive] = useState(true);

  // For multipleChoice & listeningChoice
  const [options, setOptions] = useState<PlacementOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);

  // For listeningChoice
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setQuestionText(initialData.questionText);
      setDifficulty(initialData.difficulty);
      setQuestionType(initialData.questionType);
      setIsActive(initialData.isActive);
      
      if (initialData.options && initialData.options.length > 0) {
        setOptions(initialData.options.map(o => ({ ...o, id: (o as any)._id || o.id })));
      } else {
        setOptions([
          { id: "1", text: "" },
          { id: "2", text: "" },
        ]);
      }
      
      setCorrectOptionIds(initialData.correctOptionIds || []);
      
      if (initialData.questionType === "listeningChoice" && (initialData as any).audioUrl) {
        setAudioUrl((initialData as any).audioUrl);
      }
    } else if (isOpen && !initialData) {
      // Reset form
      setQuestionText("");
      setDifficulty("medium");
      setQuestionType("multipleChoice");
      setIsActive(true);
      setOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ]);
      setCorrectOptionIds([]);
      setAudioUrl(null);
    }
  }, [isOpen, initialData]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error("Vui lòng chọn file âm thanh");
      return;
    }

    try {
      setIsUploading(true);
      const signatureResponse = await uploadService.requestSignature({
        resourceType: 'video', // Audio uploads use 'video' in Cloudinary API usually
        folder: 'audios'
      });

      if (signatureResponse.status === 'success' && signatureResponse.data) {
        const uploadResult = await uploadService.uploadToCloudinary(file, signatureResponse.data);
        setAudioUrl(uploadResult.secure_url);
        toast.success("Tải âm thanh lên thành công");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải lên file âm thanh");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), text: "" },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.warning("Cần ít nhất 2 lựa chọn");
      return;
    }
    setOptions(options.filter(o => o.id !== id));
    setCorrectOptionIds(correctOptionIds.filter(cId => cId !== id));
  };

  const handleUpdateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleToggleCorrectOption = (id: string) => {
    if (correctOptionIds.includes(id)) {
      setCorrectOptionIds(correctOptionIds.filter(cId => cId !== id));
    } else {
      setCorrectOptionIds([...correctOptionIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    if (questionType === "multipleChoice" || questionType === "listeningChoice") {
      if (options.some(o => !o.text.trim())) {
        toast.error("Vui lòng nhập nội dung cho tất cả các lựa chọn");
        return;
      }
      if (correctOptionIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất một đáp án đúng");
        return;
      }
    }

    if (questionType === "listeningChoice" && !audioUrl) {
      toast.error("Vui lòng tải lên file âm thanh cho câu hỏi Listening");
      return;
    }

    const payload: Partial<PlacementQuestion> = {
      questionText: questionText.trim(),
      difficulty,
      questionType,
      isActive,
    };

    if (questionType === "multipleChoice" || questionType === "listeningChoice") {
      payload.options = options;
      payload.correctOptionIds = correctOptionIds;
    }

    if (questionType === "listeningChoice" && audioUrl) {
      payload.audioUrl = audioUrl;
    }

    await onSave(payload);
  };

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSaving ? onClose : undefined}
      />
      <div className={`relative bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          </h2>
          <button onClick={!isSaving ? onClose : undefined} disabled={isSaving} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="question-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as PlacementQuestionType)}
                  disabled={!!initialData} // Cannot change type after creation
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white disabled:bg-gray-50"
                >
                  <option value="multipleChoice">Trắc nghiệm nhiều lựa chọn</option>
                  <option value="listeningChoice">Listening (Nghe & Chọn)</option>
                  <option value="speaking">Speaking (Nói)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ khó</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as PlacementDifficulty)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white resize-none"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            {questionType === "listeningChoice" && (
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <label className="block text-sm font-medium text-blue-900 mb-2">File Âm thanh (Audio) *</label>
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Tải file lên
                    <input type="file" accept="audio/*,.mp3" className="hidden" onChange={handleAudioUpload} disabled={isUploading} />
                  </label>
                  {audioUrl && (
                    <audio controls className="h-10 flex-1 max-w-sm" src={audioUrl} />
                  )}
                </div>
              </div>
            )}

            {(questionType === "multipleChoice" || questionType === "listeningChoice") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Các lựa chọn đáp án</label>
                  <span className="text-xs text-gray-500">Check vào ô vuông để đánh dấu đáp án đúng (có thể chọn nhiều)</span>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className={`flex items-center gap-3 p-3 rounded-xl border ${correctOptionIds.includes(option.id) ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                      <input
                        type="checkbox"
                        checked={correctOptionIds.includes(option.id)}
                        onChange={() => handleToggleCorrectOption(option.id)}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                        placeholder={`Lựa chọn ${index + 1}`}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 py-2"
                  >
                    <Plus className="w-4 h-4" /> Thêm lựa chọn
                  </button>
                </div>
              </div>
            )}

            {questionType === "speaking" && (
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                <p className="text-sm text-purple-800 font-medium">Thông tin cấu hình Speaking</p>
                <p className="text-xs text-purple-600 mt-1">Câu hỏi này sẽ yêu cầu học viên ghi âm trực tiếp. AI sẽ tự động chấm điểm phát âm dựa trên câu hỏi này. Thời gian giới hạn là 45 giây.</p>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Kích hoạt (Hiển thị trong đề thi thử)</span>
            </label>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="question-form"
            disabled={isSaving || isUploading}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Cập nhật" : "Tạo câu hỏi"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

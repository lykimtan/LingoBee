"use client";

import { useState } from "react";
import { PlacementQuestion } from "@/types";
import { Edit2, Trash2, Headphones, MessageSquare, ListTodo, Power, PowerOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ConfirmModal from "@/components/ConfirmModal";

interface PlacementQuestionsListProps {
  questions: PlacementQuestion[];
  isLoading: boolean;
  onEdit: (question: PlacementQuestion) => void;
  onDelete: (questionId: string) => void;
  onToggleActive: (questionId: string, currentStatus: boolean) => void;
}

export function PlacementQuestionsList({
  questions,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive
}: PlacementQuestionsListProps) {
  const { user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const canEditOrDelete = (q: PlacementQuestion) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    // Nếu câu hỏi có người tạo, kiểm tra xem ID người tạo có khớp với ID người dùng hiện tại không
    if (q.createdBy) {
      const creatorId = typeof q.createdBy === 'string' ? q.createdBy : q.createdBy._id;
      return user.id === creatorId || user.id === creatorId;
    }

    // Nếu câu hỏi cũ không có người tạo, tạm thời cho phép admin sửa, hoặc teacher không được sửa
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-100">
        <p className="text-gray-500">Chưa có câu hỏi nào. Hãy tạo câu hỏi đầu tiên!</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "multipleChoice":
        return <ListTodo className="w-5 h-5 text-blue-500" />;
      case "listeningChoice":
        return <Headphones className="w-5 h-5 text-green-500" />;
      case "speaking":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multipleChoice":
        return "Trắc nghiệm";
      case "listeningChoice":
        return "Listening";
      case "speaking":
        return "Speaking";
      default:
        return type;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy": return "Dễ";
      case "medium": return "Trung bình";
      case "hard": return "Khó";
      default: return diff;
    }
  };

  return (
    <div className="grid gap-4 px-6 pb-6">
      {questions.map((q) => (
        <div
          key={q._id}
          className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all ${!q.isActive ? "opacity-60 grayscale-[50%]" : "hover:border-indigo-200 hover:shadow-sm"
            }`}
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getTypeIcon(q.questionType)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 line-clamp-2">
                {q.questionText}
              </h4>

              {q.options && q.options.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                  {q.options.map((opt, idx) => {
                    const optId = opt.id || opt._id || String(idx);
                    const isCorrect = q.correctOptionIds?.includes(optId);
                    return (
                      <div key={optId} className={`flex items-start gap-2 ${isCorrect ? 'text-green-700 font-medium' : ''}`}>
                        <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border text-xs ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="line-clamp-1 flex-1">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(q.difficulty)}`}>
                  {getDifficultyLabel(q.difficulty)}
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  {getTypeLabel(q.questionType)}
                </span>
                {!q.isActive && (
                  <span className="text-red-500 font-medium border border-red-200 px-2 py-0.5 rounded-full">
                    Đã ẩn
                  </span>
                )}
                {q.createdBy && typeof q.createdBy === 'object' && q.createdBy.name && (
                  <span className="text-gray-400 flex items-center gap-1 border-l border-gray-200 pl-3">
                    Bởi: <span className="text-gray-600 font-medium">{q.createdBy.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
            {canEditOrDelete(q) ? (
              <>
                <button
                  onClick={() => onToggleActive(q._id, q.isActive)}
                  title={q.isActive ? "Ẩn câu hỏi" : "Hiển thị câu hỏi"}
                  className={`p-2 rounded-lg transition-colors ${q.isActive
                      ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                      : "text-gray-400 hover:text-green-500 hover:bg-green-50"
                    }`}
                >
                  {q.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onEdit(q)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setQuestionToDelete(q._id);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="text-xs text-gray-400 italic px-2">Không có quyền sửa</div>
            )}
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={() => {
          if (questionToDelete) {
            onDelete(questionToDelete);
          }
          setDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        title="Xóa câu hỏi"
        message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isDestructive={true}
      />
    </div>
  );
}

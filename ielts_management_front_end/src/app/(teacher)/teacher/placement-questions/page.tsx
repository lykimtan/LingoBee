"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

import { PlacementQuestionsHeader } from "@/components/teacher/placement-questions/PlacementQuestionsHeader";
import { PlacementQuestionsList } from "@/components/teacher/placement-questions/PlacementQuestionsList";
import { PlacementQuestionModal } from "@/components/teacher/placement-questions/PlacementQuestionModal";

import { placementQuestionService } from "@/services/placementQuestionService";
import { PlacementQuestion } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherPlacementQuestionsPage() {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [creatorFilter, setCreatorFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<PlacementQuestion | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const loadQuestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await placementQuestionService.getQuestions({ limit: 1000 });
            if (response.success && response.data) {
                const items = Array.isArray(response.data) ? response.data : (response.data as any).items || response.data;
                if (Array.isArray(items)) {
                    setQuestions(items);
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tải danh sách câu hỏi");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const filteredQuestions = useMemo(() => {
        return questions.filter((q) => {
            const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = difficultyFilter ? q.difficulty === difficultyFilter : true;
            const matchesType = typeFilter ? q.questionType === typeFilter : true;
            let matchesCreator = true;
            if (creatorFilter === "me" && user) {
                const creatorId = q.createdBy ? (typeof q.createdBy === 'string' ? q.createdBy : q.createdBy._id) : null;
                matchesCreator = creatorId === user.id || creatorId === user.id;
            }
            return matchesSearch && matchesDifficulty && matchesType && matchesCreator;
        });
    }, [questions, searchQuery, difficultyFilter, typeFilter, creatorFilter, user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, difficultyFilter, typeFilter, creatorFilter]);

    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredQuestions, currentPage]);

    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

    const handleFilterChange = (type: string, value: string) => {
        if (type === "difficulty") setDifficultyFilter(value);
        if (type === "questionType") setTypeFilter(value);
        if (type === "creator") setCreatorFilter(value);
    };

    const handleCreateNew = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (question: PlacementQuestion) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await placementQuestionService.deleteQuestion(id);
            toast.success("Đã xóa câu hỏi thành công");
            setQuestions(questions.filter(q => q._id !== id));
        } catch (error: any) {
            toast.error(error.message || "Không thể xóa câu hỏi");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await placementQuestionService.updateQuestion(id, { isActive: !currentStatus });
            toast.success(currentStatus ? "Đã ẩn câu hỏi" : "Đã hiển thị câu hỏi");
            setQuestions(questions.map(q => q._id === id ? { ...q, isActive: !currentStatus } : q));
        } catch (error: any) {
            toast.error(error.message || "Không thể cập nhật trạng thái");
        }
    };

    const handleSaveQuestion = async (data: Partial<PlacementQuestion>) => {
        setIsSaving(true);
        try {
            if (editingQuestion) {
                const response = await placementQuestionService.updateQuestion(editingQuestion._id, data);
                if (response.success && response.data) {
                    toast.success("Cập nhật câu hỏi thành công");
                    setQuestions(questions.map(q => q._id === editingQuestion._id ? response.data! : q));
                    setIsModalOpen(false);
                }
            } else {
                const response = await placementQuestionService.createQuestion(data);
                if (response.success && response.data) {
                    toast.success("Tạo câu hỏi thành công");
                    setQuestions([response.data, ...questions]);
                    setIsModalOpen(false);
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra khi lưu câu hỏi");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1 w-full">
                <div className="w-full pt-6">
                    <PlacementQuestionsHeader
                        onSearch={setSearchQuery}
                        onFilterChange={handleFilterChange}
                        onCreateClick={handleCreateNew}
                    />
                    <PlacementQuestionsList
                        questions={paginatedQuestions}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                    />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-sm text-gray-500">
                                Hiển thị <span className="font-medium text-gray-900">{paginatedQuestions.length}</span> trong số <span className="font-medium text-gray-900">{filteredQuestions.length}</span> câu hỏi
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Trước
                                </button>
                                <span className="text-sm text-gray-600 px-2">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <PlacementQuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveQuestion}
                initialData={editingQuestion}
                isSaving={isSaving}
            />
        </div>
    );
}

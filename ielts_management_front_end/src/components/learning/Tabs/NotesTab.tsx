"use client";

import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import ConfirmModal from '@/components/ConfirmModal';
import { Clock, Plus, Save, Trash2, Edit2, Loader2 } from 'lucide-react';
import { learningService, VideoNote } from '@/services/learningService';

interface NotesTabProps {
    videoId: string;
    courseId: string;
    currentTime: number;
    onFocus?: () => void;
    onSeekTo?: (time: number) => void;
}

export const NotesTab = ({ videoId, courseId, currentTime, onFocus, onSeekTo }: NotesTabProps) => {
    const [noteContent, setNoteContent] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [savedNotes, setSavedNotes] = useState<VideoNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const response = await learningService.getVideoNotes(videoId);
                if (response.success && response.data) {
                    setSavedNotes(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (videoId) {
            fetchNotes();
        }
    }, [videoId]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSave = async () => {
        if (!noteContent.trim() || noteContent === '<p></p>') return;

        setIsSaving(true);
        try {
            if (editingNoteId) {
                const response = await learningService.updateNote(editingNoteId, noteContent);
                if (response.success && response.data) {
                    setSavedNotes(prev => prev.map(n => n._id === editingNoteId ? response.data! : n));
                }
            } else {
                const response = await learningService.createNote({
                    videoId,
                    courseId,
                    timestamp: currentTime,
                    content: noteContent
                });

                if (response.success && response.data) {
                    setSavedNotes(prev => [...prev, response.data!].sort((a, b) => a.timestamp - b.timestamp));
                }
            }

            setNoteContent('');
            setIsComposing(false);
            setEditingNoteId(null);
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (noteId: string) => {
        setNoteToDelete(noteId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!noteToDelete) return;

        setIsDeleting(true);
        try {
            const response = await learningService.deleteNote(noteToDelete);
            if (response.success) {
                setSavedNotes(prev => prev.filter(n => n._id !== noteToDelete));
                setDeleteModalOpen(false);
                setNoteToDelete(null);
            }
        } catch (error) {
            console.error("Failed to delete note", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (note: VideoNote) => {
        setEditingNoteId(note._id);
        setNoteContent(note.content);
        setIsComposing(true);
        if (onFocus) onFocus(); // Pause video when editing
    };

    const cancelCompose = () => {
        setIsComposing(false);
        setNoteContent('');
        setEditingNoteId(null);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-3">
                {!isComposing ? (
                    <button
                        onClick={() => {
                            setIsComposing(true);
                            if (onFocus) onFocus();
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/80"
                    >
                        <Plus size={16} /> Thêm ghi chú tại {formatTime(currentTime)}
                    </button>
                ) : (
                    <div className="flex flex-col gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-semibold text-[#f4e900] bg-[#f4e900]/10 px-2 py-1 rounded flex items-center gap-1.5">
                                <Clock size={12} />
                                {editingNoteId ? 'Chỉnh sửa ghi chú' : formatTime(currentTime)}
                            </span>
                        </div>
                        <RichTextEditor
                            value={noteContent}
                            onChange={setNoteContent}
                            onFocus={onFocus}
                            placeholder="Ghi chú của bạn..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelCompose}
                                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !noteContent.trim() || noteContent === '<p></p>'}
                                className="px-4 py-2 text-sm font-semibold text-black bg-[#f4e900] rounded-lg hover:bg-[#f4e900]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[#f4e900]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {editingNoteId ? 'Cập nhật' : 'Lưu ghi chú'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 mt-2 overflow-y-auto flex-1 pb-10 custom-scrollbar pr-2 min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-[#f4e900]" size={24} />
                    </div>
                ) : savedNotes.length === 0 ? (
                    <div className="text-center py-10 text-white/40 text-sm">
                        Chưa có ghi chú nào cho bài học này.
                    </div>
                ) : (
                    savedNotes.map(note => (
                        <div key={note._id} className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => onSeekTo && onSeekTo(note.timestamp)}
                                    className="text-xs font-semibold text-[#f4e900] bg-[#f4e900]/10 px-2 py-1 rounded flex items-center gap-1.5 hover:bg-[#f4e900]/20 transition-colors"
                                >
                                    <Clock size={12} />
                                    {formatTime(note.timestamp)}
                                </button>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                        onClick={() => startEdit(note)}
                                        title="Sửa ghi chú"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
                                        onClick={() => handleDeleteClick(note._id)}
                                        title="Xóa ghi chú"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div
                                className="text-sm text-white/80 prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[#f4e900]"
                                dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Xóa ghi chú"
                message="Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
};

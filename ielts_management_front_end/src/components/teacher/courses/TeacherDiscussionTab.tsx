"use client";

import React, { useState, useEffect } from 'react';
import { commentService, CommentModel } from '@/services/commentService';
import { useAuthContext } from '@/context/AuthContext';
import { Loader2, MessageSquare, Heart, Send, CornerDownRight, Trash2, Edit2, CornerUpLeft } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface TeacherDiscussionTabProps {
  targetId: string;
  targetType: 'Video' | 'Course' | 'User';
  onSeekTo?: (time: number) => void;
}

export const TeacherDiscussionTab = ({ targetId, targetType, onSeekTo }: TeacherDiscussionTabProps) => {
  const { user } = useAuthContext();
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states for deleting
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [targetId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await commentService.getComments(targetType, targetId, 1, 50); // Fetching 50 comments for now
      if (response.success && response.data) {
        // We will initialize replies array for each comment
        const fetchedComments = response.data.map(c => ({ ...c, replies: [], showReplies: false }));
        setComments(fetchedComments);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await commentService.createComment({
        targetType,
        targetId,
        content: newCommentText
      });
      if (response.success && response.data) {
        setComments([ { ...response.data, replies: [], showReplies: false }, ...comments ]);
        setNewCommentText('');
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    try {
      const response = await commentService.deleteComment(commentToDelete);
      if (response.success) {
        // Remove from UI
        setComments(prev => prev.map(c => ({
          ...c,
          replies: c.replies?.filter(r => r._id !== commentToDelete)
        })).filter(c => c._id !== commentToDelete));
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const parseTimeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const renderContentWithTimestamps = (content: string) => {
    const timeRegex = /\b((?:[0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9])\b/g;
    const parts = content.split(timeRegex);

    return (
      <>
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSeekTo && onSeekTo(parseTimeToSeconds(part))}
                className="text-blue-600 font-semibold hover:underline bg-blue-50 px-1 rounded transition-colors inline-flex items-center"
                title="Bấm để tua video tới đoạn này"
              >
                {part}
              </button>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CommentModel, isReply?: boolean }) => {
    const hasLiked = user && comment.likes.includes(user.id);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
    const [localIsLiked, setLocalIsLiked] = useState(hasLiked);

    const handleToggleLike = async () => {
      if (!user) return alert("Vui lòng đăng nhập để thích bình luận");
      setIsLiking(true);
      try {
        const response = await commentService.toggleLike(comment._id);
        if (response.success && response.data) {
          setLocalIsLiked(response.data.isLiked);
          setLocalLikeCount(response.data.likeCount);
        }
      } catch (error) {
        console.error("Failed to toggle like", error);
      } finally {
        setIsLiking(false);
      }
    };

    const loadReplies = async () => {
      try {
        const response = await commentService.getReplies(comment._id);
        if (response.success && response.data) {
          setComments(prev => prev.map(c => 
            c._id === comment._id ? { ...c, replies: response.data!, showReplies: true } : c
          ));
        }
      } catch (error) {
        console.error("Failed to load replies", error);
      }
    };

    const toggleReplies = () => {
      if (!comment.showReplies && (!comment.replies || comment.replies.length === 0)) {
        loadReplies();
      } else {
        setComments(prev => prev.map(c => 
          c._id === comment._id ? { ...c, showReplies: !c.showReplies } : c
        ));
      }
    };

    const submitReply = async () => {
      if (!replyText.trim()) return;
      try {
        const response = await commentService.createComment({
          targetType,
          targetId,
          content: replyText,
          parentId: comment._id
        });
        if (response.success && response.data) {
          setComments(prev => prev.map(c => 
            c._id === comment._id 
              ? { ...c, replies: [...(c.replies || []), response.data!], showReplies: true } 
              : c
          ));
          setReplyText('');
          setIsReplying(false);
        }
      } catch (error) {
        console.error("Failed to submit reply", error);
      }
    };

    return (
      <div className={`flex gap-3 w-full ${isReply ? 'mt-3' : 'mt-6'}`}>
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50/80 rounded-2xl rounded-tl-none p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-gray-900 text-sm">{comment.author.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {renderContentWithTimestamps(comment.content)}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button 
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${localIsLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-700'}`}
            >
              <Heart size={14} className={localIsLiked ? 'fill-red-500' : ''} />
              {localLikeCount > 0 ? localLikeCount : 'Thích'}
            </button>
            
            {!isReply && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
              >
                <CornerUpLeft size={14} />
                Trả lời
              </button>
            )}

            {/* Giáo viên luôn có quyền Ẩn bình luận */}
            <button 
              onClick={() => handleDeleteClick(comment._id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto"
            >
              <Trash2 size={14} />
              Ẩn bình luận
            </button>
          </div>

          {/* Reply Input Box */}
          {isReplying && (
            <div className="flex gap-3 mt-3 items-end">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết câu trả lời..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitReply();
                }}
              />
              <button 
                onClick={submitReply}
                disabled={!replyText.trim()}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Load Replies Button */}
          {!isReply && (comment.showReplies || (comment as any).replyCount > 0) && (
            <button 
              onClick={toggleReplies}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 mt-3 ml-2 hover:underline"
            >
              <CornerDownRight size={14} />
              {comment.showReplies ? 'Ẩn câu trả lời' : 'Xem các câu trả lời'}
            </button>
          )}

          {/* Nested Replies */}
          {comment.showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="pl-4 border-l-2 border-gray-100 mt-3 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex gap-4 items-start bg-white p-4 md:p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50">
        <div className="flex-shrink-0 mt-1">
          {user?.avatar ? (
            <img src={user.avatar} alt="Your avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-blue-200" />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100">
              <MessageSquare className="text-blue-500" size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Viết nội dung phản hồi, thảo luận bài học..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all min-h-[80px] resize-y placeholder:text-gray-400"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePostComment}
              disabled={isSubmitting || !newCommentText.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Đăng bình luận
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mt-4">
        <MessageSquare size={18} className="text-blue-500" />
        <h3 className="text-lg font-bold text-gray-800">Tất cả bình luận ({comments.length})</h3>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Chưa có thảo luận nào trong video này.</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Ẩn bình luận"
        message="Bạn có chắc chắn muốn ẩn bình luận này khỏi hệ thống không? (Soft Delete)"
        confirmText="Xác nhận Ẩn"
        cancelText="Hủy"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

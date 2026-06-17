import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User } from 'lucide-react';
import ChatMainArea from '@/components/teacher/courses/chat/ChatMainArea';
import { conversationService } from '@/services/conversationService';
import { Conversation } from '@/types';
import { useSocket } from '@/hooks/useSocket';

interface LearningChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onUnreadCountChange?: (count: number) => void;
}

export const LearningChatDrawer: React.FC<LearningChatDrawerProps> = ({ isOpen, onClose, courseId, onUnreadCountChange }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'private'>('groups');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [unreadGroup, setUnreadGroup] = useState(0);
  const [unreadPrivate, setUnreadPrivate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!courseId) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const res = await conversationService.getCourseConversations(courseId);
        if (res.status === 'success' && res.data) {
          setConversations(res.data);

          // Mặc định chọn group
          const groupConv = res.data.find(c => c.type === 'group');
          if (groupConv) {
            setSelectedConversation(groupConv);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isOpen, courseId]);


  useEffect(() => {
    onUnreadCountChange?.(unreadGroup + unreadPrivate);
  }, [unreadGroup, unreadPrivate, onUnreadCountChange]);


  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'groups') setUnreadGroup(0);
      if (activeTab === 'private') setUnreadPrivate(0);
    }
  }, [isOpen, activeTab]);


  useEffect(() => {
    if (!socket || !isConnected || conversations.length === 0) return;


    conversations.forEach(c => {
      socket.emit('chat:joinRoom', c._id);
    });

    const handleGlobalMessage = (msg: any) => {
      const conv = conversations.find(c => c._id === msg.conversationId);
      if (!conv) return;


      const isActiveTab = isOpen && conv.type === (activeTab === 'groups' ? 'group' : 'private');
      if (isActiveTab) return;

      if (conv.type === 'private') {
        setUnreadPrivate(prev => prev + 1);

        try {
          const audio = new Audio('/soundEffect/iphone_msg_sent.mp3');
          audio.play().catch(() => { });
        } catch (e) { }
      } else if (conv.type === 'group') {
        setUnreadGroup(prev => prev + 1);
      }
    };

    socket.on('chat:newMessage', handleGlobalMessage);

    return () => {
      socket.off('chat:newMessage', handleGlobalMessage);
    };
  }, [socket, isConnected, conversations, isOpen, activeTab]);

  // Đổi tab
  const handleTabChange = (tab: 'groups' | 'private') => {
    setActiveTab(tab);
    const conv = conversations.find(c => c.type === (tab === 'groups' ? 'group' : 'private'));
    setSelectedConversation(conv || null);
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Hỏi đáp lớp học
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50 border-b border-gray-100">
          <button
            onClick={() => handleTabChange('groups')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors relative ${activeTab === 'groups'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            Lớp chung
            {unreadGroup > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('private')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors relative ${activeTab === 'private'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <User className="w-4 h-4" />
            Giáo viên
            {unreadPrivate > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden min-h-0 bg-gray-50 relative flex flex-col">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedConversation ? (
            <ChatMainArea
              conversation={selectedConversation}
              socket={socket}
              isConnected={isConnected}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-gray-500">
                {activeTab === 'groups'
                  ? 'Chưa có nhóm lớp chung nào.'
                  : 'Bạn chưa có cuộc trò chuyện riêng nào với giáo viên.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

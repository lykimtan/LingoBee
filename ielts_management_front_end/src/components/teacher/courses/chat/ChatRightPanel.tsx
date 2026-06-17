import React from 'react';
import { Users, Calendar, FileText, Image as ImageIcon, Pin } from 'lucide-react';
import { Conversation } from '@/types';

import { useAuth } from '@/hooks/useAuth';

interface ChatRightPanelProps {
  conversation: Conversation;
  courseName?: string;
}

export default function ChatRightPanel({ conversation, courseName }: ChatRightPanelProps) {
  const { user } = useAuth();
  let chatName = conversation.type === 'group' ? (courseName ? `${courseName} Group` : 'Nhóm Lớp Chung') : 'Chat Riêng Tư';
  let chatAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=eff6ff&color=3b82f6`;
  
  if (conversation.type === 'private') {
    const studentParticipant = conversation.participants.find(p => {
      if (typeof p.userId === 'object' && p.userId !== null) {
        return (p.userId as any).role === 'student';
      }
      return false; // Cannot determine role if not populated
    });
    
    // Fallback logic if no student found (e.g. teacher talking to admin, or data missing)
    const targetParticipant = studentParticipant || conversation.participants.find(p => {
      const myId = String(user?.id || (user as any)?._id || '');
      const pId = String(typeof p.userId === 'object' && p.userId !== null ? (p.userId as any)._id : p.userId);
      return pId !== myId;
    });

    if (targetParticipant && typeof targetParticipant.userId === 'object') {
      const targetUser = targetParticipant.userId as any;
      chatName = targetUser.name || 'User';
      chatAvatar = targetUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=eff6ff&color=3b82f6`;
    }
  }

  return (
    <div className="w-72 border-l border-gray-100 bg-white flex flex-col">
      <div className="p-8 flex flex-col items-center text-center border-b border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-gray-400 border border-gray-200 shadow-sm overflow-hidden">
          {conversation.type === 'group' ? (
            <Users className="w-8 h-8" />
          ) : (
            <img src={chatAvatar} className="w-full h-full object-cover" alt="avatar" />
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-lg">
          {chatName}
        </h3>
        <p className="text-sm font-medium text-gray-500 mt-1">Thông tin chi tiết</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Upcoming Live Sessions */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
            Upcoming Live Sessions
          </h4>
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
            <p className="text-sm font-bold text-gray-900 mb-1">Speaking Workshop</p>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Today, 2:00 PM</span>
            </div>
          </div>
        </div>

        {/* Shared Resources */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
            Shared Resources (4)
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors truncate">Speaking_Part2.pdf</p>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors truncate">Vocab_Sheet.png</p>
            </div>
          </div>
        </div>

        {/* Pinned Messages */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            Pinned Messages
          </h4>
          <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl text-sm italic text-gray-600 relative">
            <Pin className="w-3 h-3 text-gray-400 absolute top-4 right-4" />
            "Welcome to the IELTS Mastery Group. Remember to keep all discussions in English for maximum practice!"
          </div>
        </div>

      </div>
    </div>
  );
}

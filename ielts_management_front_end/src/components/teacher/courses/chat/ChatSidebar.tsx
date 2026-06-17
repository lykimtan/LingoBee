import React from 'react';
import { Search, Loader2, Users, User } from 'lucide-react';
import { Conversation } from '@/types';

interface ChatSidebarProps {
  activeTab: 'groups' | 'private';
  setActiveTab: (t: 'groups' | 'private') => void;
  selectedId: string;
  onSelect: (id: string) => void;
  conversations: Conversation[];
  isLoading: boolean;
  students?: any[];
  onCreatePrivateChat?: (studentId: string) => void;
  courseName?: string;
}

export default function ChatSidebar({ activeTab, setActiveTab, selectedId, onSelect, conversations, isLoading, students, onCreatePrivateChat, courseName }: ChatSidebarProps) {
  
  const groups = conversations.filter(c => c.type === 'group');
  const privates = conversations.filter(c => c.type === 'private');

  const renderGroups = () => {
    if (groups.length === 0) {
      return (
        <div className="p-8 text-center text-sm font-medium text-gray-500">
          Chưa có nhóm nào.
        </div>
      );
    }

    return groups.map(convo => {
      const avatar = `https://ui-avatars.com/api/?name=Group&background=f3f4f6&color=374151`;
      return (
        <div 
          key={convo._id}
          onClick={() => onSelect(convo._id)}
          className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedId === convo._id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-100/80'}`}
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-bold text-gray-900 text-sm truncate pr-2">
                {courseName ? `${courseName} Group` : 'Nhóm Lớp Chung'}
              </h4>
              <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                {convo.lastMessage ? new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 truncate pr-2">
                {convo.lastMessage ? convo.lastMessage.message : 'Chưa có tin nhắn...'}
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderPrivates = () => {
    if (!students || students.length === 0) {
      return (
        <div className="p-8 text-center text-sm font-medium text-gray-500">
          Chưa có học viên nào.
        </div>
      );
    }

    return students.map(student => {
      const existingConvo = privates.find(c => 
        c.participants.some(p => {
          const participantUserId = typeof p.userId === 'object' && p.userId !== null ? (p.userId as any)._id : p.userId;
          return participantUserId === student._id;
        })
      );

      const convoId = existingConvo?._id;
      const isSelected = selectedId === convoId;
      const avatar = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'User')}&background=eff6ff&color=3b82f6`;
      const lastMsg = existingConvo?.lastMessage?.message || 'Bấm để nhắn tin...';
      const lastTime = existingConvo?.lastMessage?.createdAt 
        ? new Date(existingConvo.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : '';

      return (
        <div 
          key={student._id}
          onClick={() => {
            if (existingConvo) {
              onSelect(existingConvo._id);
            } else {
              onCreatePrivateChat?.(student._id);
            }
          }}
          className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-100/80'}`}
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-bold text-gray-900 text-sm truncate pr-2">
                {student.name}
              </h4>
              <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                {lastTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-500 truncate pr-2">
                {lastMsg}
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
      <div className="p-6 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-100/80 hover:bg-gray-200/50 focus:bg-white border-transparent focus:border-gray-300 focus:ring-0 rounded-xl text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex px-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('groups')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'groups' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" /> Course Groups
        </button>
        <button 
          onClick={() => setActiveTab('private')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'private' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <User className="w-4 h-4" /> Private Chats
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          activeTab === 'groups' ? renderGroups() : renderPrivates()
        )}
      </div>
    </div>
  );
}

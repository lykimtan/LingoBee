import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import ChatRightPanel from './ChatRightPanel';
import { conversationService } from '@/services/conversationService';
import { Conversation } from '@/types';
import { useSocket } from '@/hooks/useSocket';

export default function CourseMessagingTab({ courseId, courseName }: { courseId: string, courseName?: string }) {
  const [activeTab, setActiveTab] = useState<'groups' | 'private'>('groups');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  // Initialize socket connection at the tab level so it's shared
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [convRes, studentRes] = await Promise.all([
          conversationService.getCourseConversations(courseId),
          import('@/services/courseService').then(m => m.courseService.getCourseStudents(courseId))
        ]);

        if (convRes.status === 'success' && convRes.data) {
          setConversations(convRes.data);
          const firstGroup = convRes.data.find(c => c.type === 'group');
          if (firstGroup) {
            setSelectedConversation(firstGroup);
          }
        }

        if (studentRes.status === 'success' && studentRes.data) {
          setStudents(studentRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleCreatePrivateChat = async (studentId: string) => {
    try {
      const res = await conversationService.createPrivateConversation(courseId, studentId);
      if (res.status === 'success' && res.data) {
        const newConvo = res.data;
        setConversations(prev => [newConvo, ...prev]);
        setSelectedConversation(newConvo);
      }
    } catch (error) {
      console.error('Error creating private chat:', error);
    }
  };

  return (
    <div className="flex h-[800px] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <ChatSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedId={selectedConversation?._id || ''}
        onSelect={(id) => {
          const convo = conversations.find(c => c._id === id);
          if (convo) setSelectedConversation(convo);
        }}
        conversations={conversations}
        students={students}
        onCreatePrivateChat={handleCreatePrivateChat}
        isLoading={isLoading}
        courseName={courseName}
      />

      {selectedConversation ? (
        <ChatMainArea 
          conversation={selectedConversation} 
          socket={socket} 
          isConnected={isConnected}
          courseName={courseName}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa chọn cuộc trò chuyện</h3>
          <p className="text-gray-500 text-sm">Chọn một nhóm hoặc học viên bên trái để bắt đầu nhắn tin</p>
        </div>
      )}

      {selectedConversation && (
        <ChatRightPanel conversation={selectedConversation} courseName={courseName} />
      )}
    </div>
  );
}

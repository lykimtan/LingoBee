import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Download, Bold, Italic, Link2, Smile, Send, Plus, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Conversation, Message, ChatAttachment } from '@/types';
import { conversationService } from '@/services/conversationService';
import { uploadService } from '@/services/uploadService';
import { useAuth } from '@/hooks/useAuth';
import { Socket } from 'socket.io-client';

interface ChatMainAreaProps {
  conversation: Conversation;
  socket: Socket | null;
  isConnected: boolean;
  courseName?: string;
}

export default function ChatMainArea({ conversation, socket, isConnected, courseName }: ChatMainAreaProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Input states
  const [textInput, setTextInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);

  let chatName = conversation.type === 'group' ? (courseName ? `${courseName} Group` : 'Nhóm Lớp Chung') : 'Chat Riêng';
  let chatAvatar = conversation.type === 'group'
    ? 'https://ui-avatars.com/api/?name=Group&background=f3f4f6&color=374151'
    : 'https://ui-avatars.com/api/?name=Private&background=eff6ff&color=3b82f6';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!conversation._id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await conversationService.getMessages(conversation._id);
        if (response.status === 'success' && response.data) {
          setMessages(response.data.reverse());
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation._id]);

  // Socket logic
  useEffect(() => {
    if (!socket || !isConnected || !conversation._id) return;

    // Join room
    socket.emit('chat:joinRoom', conversation._id);

    // Listen to new messages
    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId === conversation._id) {
        setMessages(prev => {
          // Prevent duplicates if sender is us and we already added it locally
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
    };

    socket.on('chat:newMessage', handleNewMessage);

    return () => {
      socket.off('chat:newMessage', handleNewMessage);
    };
  }, [socket, isConnected, conversation._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async () => {
    if ((!textInput.trim() && pendingAttachments.length === 0) || isSending) return;

    setIsSending(true);
    try {
      const response = await conversationService.sendMessage(
        conversation._id,
        textInput.trim(),
        pendingAttachments
      );

      if (response.status === 'success' && response.data) {
        // Prevent duplicates from race conditions (Socket might arrive before HTTP response)
        setMessages(prev => {
          if (prev.some(m => m._id === response.data!._id)) return prev;
          return [...prev, response.data!];
        });
        
        setTextInput('');
        setPendingAttachments([]);
        scrollToBottom();

        // Play sound effect
        try {
          const audio = new Audio('/soundEffect/iphone_msg_sent.mp3');
          audio.play().catch(e => console.error('Error playing sound:', e));
        } catch (e) {
          console.error('Audio playback not supported', e);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle File Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Determine resource type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const resourceType = isImage ? 'image' : isVideo ? 'video' : 'raw';

      // 1. Get Signature
      const sigResponse = await uploadService.requestSignature({
        resourceType,
        folder: 'materials'
      });

      if (sigResponse.status !== 'success' || !sigResponse.data) {
        throw new Error('Failed to get upload signature');
      }

      // 2. Upload directly to Cloudinary
      const uploadResult = await uploadService.uploadToCloudinary(file, sigResponse.data);

      // 3. Add to pending attachments
      setPendingAttachments(prev => [...prev, {
        url: uploadResult.secure_url,
        fileType: file.type,
        fileName: file.name
      }]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Tải file lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <img src={chatAvatar} className="w-10 h-10 rounded-full" alt="avatar" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {chatName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs font-medium text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 text-sm">
            Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map(msg => {
            const myId = String(user?.id || (user as any)?._id || '');
            const msgSenderId = String(typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId);
            const isMe = msgSenderId === myId;

            let senderName = 'User';
            let senderAvatar = '';

            const part = conversation.participants.find(p => {
              const pId = typeof p.userId === 'object' && p.userId !== null ? String((p.userId as any)._id) : String(p.userId);
              return pId === msgSenderId;
            });

            if (part && typeof part.userId === 'object') {
              senderName = (part.userId as any).name || 'User';
              senderAvatar = (part.userId as any).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=f3f4f6&color=374151`;
            } else if (typeof msg.senderId === 'object') {
              const senderObj = msg.senderId as any;
              senderName = senderObj.name || 'User';
              senderAvatar = senderObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=f3f4f6&color=374151`;
            } else {
              senderAvatar = `https://ui-avatars.com/api/?name=User`;
            }

            if (isMe) {
              return (
                <div key={msg._id} className="flex justify-end gap-3 max-w-[90%] ml-auto">
                  <div className="items-end flex flex-col w-full">
                    <div className="flex items-baseline justify-end gap-2 mb-1 w-full">
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold rounded uppercase">
                        {msg.senderRole}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">You</span>
                    </div>
                    <div className="bg-gray-900 text-white p-4 rounded-2xl rounded-tr-sm text-sm max-w-[80%] break-words">
                      {msg.message}
                    </div>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((att, i) => {
                          const isImage = att.fileType?.startsWith('image/');
                          const isVideo = att.fileType?.startsWith('video/');
                          
                          if (isImage) return (
                            <div key={i} className="mt-2 rounded-xl overflow-hidden shadow-sm max-w-xs border border-gray-100">
                              <img src={att.url} alt={att.fileName || 'Image attachment'} className="w-full h-auto max-h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer" onClick={() => window.open(att.url, '_blank')} />
                            </div>
                          );
                          if (isVideo) return (
                            <div key={i} className="mt-2 rounded-xl overflow-hidden shadow-sm max-w-xs border border-gray-100">
                              <video src={att.url} controls className="w-full h-auto max-h-64 bg-black" />
                            </div>
                          );
                          return (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 rounded-xl w-max shadow-sm mt-2">
                              <a href={att.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                                {att.fileName || 'Attachment'}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg._id} className="flex gap-3 max-w-[90%]">
                <img src={senderAvatar} className="w-10 h-10 rounded-full flex-shrink-0" alt="avatar" />
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-sm">{senderName}</span>
                    <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[9px] font-bold rounded uppercase">
                      {msg.senderRole}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl rounded-tl-sm text-sm shadow-sm break-words">
                    {msg.message}
                  </div>
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((att, i) => {
                        const isImage = att.fileType?.startsWith('image/');
                        const isVideo = att.fileType?.startsWith('video/');
                        
                        if (isImage) return (
                          <div key={i} className="mt-2 rounded-xl overflow-hidden shadow-sm max-w-xs border border-gray-100">
                            <img src={att.url} alt={att.fileName || 'Image attachment'} className="w-full h-auto max-h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer" onClick={() => window.open(att.url, '_blank')} />
                          </div>
                        );
                        if (isVideo) return (
                          <div key={i} className="mt-2 rounded-xl overflow-hidden shadow-sm max-w-xs border border-gray-100">
                            <video src={att.url} controls className="w-full h-auto max-h-64 bg-black" />
                          </div>
                        );
                        return (
                          <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-xl w-max shadow-sm mt-2">
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                              {att.fileName || 'Attachment'}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 pt-2 bg-white">
        <div className="border border-gray-200 rounded-3xl bg-gray-50/50 p-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">

          {/* Pending Attachments */}
          {pendingAttachments.length > 0 && (
            <div className="flex gap-2 mb-3 px-2 flex-wrap">
              {pendingAttachments.map((att, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                  <span className="truncate max-w-[150px]">{att.fileName}</span>
                  <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-500 font-bold">&times;</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            <input

              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors mb-1 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
            <textarea
              placeholder="Nhập tin nhắn..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full max-h-32 min-h-[44px] bg-transparent text-gray-900 resize-none border-none focus:ring-0 text-sm py-3 px-1 focus:outline-none"
              rows={1}
            ></textarea>
            <button
              onClick={handleSendMessage}
              disabled={isSending || (!textInput.trim() && pendingAttachments.length === 0)}
              className="p-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors mb-1 shadow-sm disabled:opacity-50 disabled:bg-gray-400"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

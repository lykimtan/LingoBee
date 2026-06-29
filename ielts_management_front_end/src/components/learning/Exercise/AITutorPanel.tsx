'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';

import { Bot, Send, User, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';


import { getTutorChatTransport } from '@/services/chatService';

interface AITutorPanelProps {
  questionContext: {
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    questionType: string;
    explanation?: string;
    transcript?: string;
  };
  onClose: () => void;
}

export default function AITutorPanel({ questionContext, onClose }: AITutorPanelProps) {
  // Stringify the context to avoid recreating the transport on every render due to inline object literal
  const contextString = JSON.stringify(questionContext);
  const transport = React.useMemo(() => getTutorChatTransport(JSON.parse(contextString)), [contextString]);

  const [input, setInput] = React.useState('');

  const { messages, status, append, sendMessage } = useChat({
    transport,
  }) as any;

  const isLoading = status === 'submitted' || status === 'streaming';
  const submitMessage = append || sendMessage;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitMessage({ role: 'user', content: input });
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialized = useRef(false);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && submitMessage && !initialized.current) {
      initialized.current = true;
      submitMessage({
        role: 'user',
        content: 'Hãy giải thích cho tôi tại sao tôi lại làm sai câu này và đáp án đúng là gì nhé.'
      });
    }
  }, [messages.length, submitMessage]);

  return (
    <div className="mt-4 border border-blue-500/30 rounded-xl overflow-hidden bg-blue-900/10 shadow-lg relative animate-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600/20 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
            <Image src="/inlectualBee.gif" alt="Bee thông thái" width={40} height={40} unoptimized className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-blue-100">AI Gia Sư (IELTS Tutor)</h3>
            <p className="text-[10px] text-blue-300/80">Giải thích chi tiết lỗi sai và ngữ pháp</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-[350px] min-h-[150px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
        {messages.filter((m: any) => m.role !== 'user' || m.content !== 'Hãy giải thích cho tôi tại sao tôi lại làm sai câu này và đáp án đúng là gì nhé.').map((message: any) => {
          let textContent = message.content;
          if (!textContent && message.parts) {
            textContent = message.parts
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('');
          }

          return (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 ${message.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-slate-800 text-blue-50 rounded-bl-sm border border-white/5 shadow-sm'
                }`}>
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  {message.role === 'user' ? <User size={14} /> : <Image src="/inlectualBee.gif" alt="Bee thông thái" width={24} height={24} unoptimized className="text-blue-400" />}
                  <span className="text-xs font-medium">{message.role === 'user' ? 'Bạn' : 'Gia Sư AI'}</span>
                </div>
                <div className="text-sm leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-blue-200" {...props} />,
                    }}
                  >
                    {textContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400 text-sm px-2">
            <Loader2 size={14} className="animate-spin" />
            <span className="animate-pulse">Gia sư đang gõ phím...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900/50 border-t border-blue-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if ((input || '').trim()) handleSubmit(e);
          }}
          className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-white/10 focus-within:border-blue-500 transition-colors"
        >
          <input
            value={input || ''}
            onChange={handleInputChange}
            placeholder="Hỏi thêm gia sư nếu bạn chưa hiểu..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!(input || '').trim() || isLoading}
            className="p-1.5 text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

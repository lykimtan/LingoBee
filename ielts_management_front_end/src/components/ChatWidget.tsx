'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { X, Send, User } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';
import { getChatTransport } from '@/services/chatService';

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowBubble(true);
    }, 2000);
    const hideInitialTimer = setTimeout(() => {
      setShowBubble(false);
    }, 7000);

    const interval = setInterval(() => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 5000);
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideInitialTimer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
    }
  }, [isOpen]);

  // Tạo transport object cho Vercel AI SDK v6 thông qua service
  const transport = React.useMemo(() => getChatTransport(), []);

  const { messages, status, append, sendMessage } = useChat({
    transport,
    // @ts-ignore
    maxSteps: 5,
  }) as any;

  const isLoading = status === 'submitted' || status === 'streaming';
  const submitMessage = append || sendMessage;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (submitMessage) {
      submitMessage({ role: 'user', content: input });
    }
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Kiểm tra xem trang hiện tại có được phép hiển thị ChatWidget không
  const isAllowedPage = pathname === '/' || pathname?.startsWith('/courses');

  if (!isAllowedPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bong bóng suy nghĩ */}
      {!isOpen && (
        <div
          className={`absolute bottom-[75px] right-2 mb-2 w-max rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_0_rgba(245,158,11,0.35)] ring-1 ring-amber-500/50 transition-all duration-500 ease-out origin-bottom-right ${showBubble ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
          <span className="flex items-center gap-1.5">
            Thắc mắc điều gì cứ hỏi mình nhé <span className="animate-bounce"> {'<3'}</span>
          </span>

          {/* Mũi tên chỉ xuống được bo góc viền nhẹ để liền mạch với box */}
          <div className="absolute -bottom-1.5 right-5 h-3.5 w-3.5 rotate-45 border-b border-r border-amber-500/50 bg-amber-500"></div>
        </div>
      )}

      {/* Nút Toggle Glassmorphism (làm cho nền tối mờ hơn một chút) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2e3a]/40 backdrop-blur-md border border-white/30 text-amber-500 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/10 focus:outline-none"
      >
        {isOpen ? <X size={24} /> :
          <Image
            src="/FriendlyBee.gif"
            alt="LingoBee AI Support"
            width={100}
            height={100}
            priority
            className="object-contain"
          />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 flex h-[500px] w-[320px] flex-col overflow-hidden rounded-2xl bg-[#0f1d24]/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] sm:w-[380px] transition-all duration-300 ease-in-out">
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[url('/path/to/lingobee-logo-pattern.svg')] bg-cover bg-center"></div>
          <div className="flex items-center justify-between bg-amber-500/30 backdrop-blur-sm p-4 text-white shadow-sm z-10 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-15 w-15 items-center justify-center rounded-full bg-white/20 text-amber-500">
                <Image
                  src="/BeeRobot.png"
                  alt="LingoBee AI Support"
                  width={100}
                  height={100}
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold tracking-wide text-sm text-white">LingoBee Support</h3>
                <p className="text-xs text-white/90">AI luôn sẵn sàng tư vấn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area (nền tối đồng nhất, không trong suốt) */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#162933] z-10">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-white/80 space-y-3">
                <div className="rounded-full bg-amber-100/10 backdrop-blur-sm p-4">
                  <Image
                    src="/BeeRobot.png"
                    alt="LingoBee AI Support"
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Xin chào!</h4>
                  <p className="text-sm text-white/70 mt-1">Mình là trợ lý AI của LingoBee.<br />Bạn muốn tìm hiểu về khóa học nào?</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message: any) => {
                  let textContent = message.content;
                  if (!textContent && message.parts) {
                    textContent = message.parts
                      .filter((part: any) => part.type === 'text')
                      .map((part: any) => part.text)
                      .join('');
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 border border-white/20 shadow-md ${message.role === 'user'
                          ? 'bg-amber-500 text-white rounded-br-sm'
                          : 'bg-[#1c2f3a] text-white rounded-bl-sm shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {message.role === 'user' ? (
                            <User size={14} className="opacity-80 text-white" />
                          ) : (
                            <Image
                              src="/FriendlyBee.gif"
                              alt="LingoBee AI Support"
                              width={30}
                              height={30}
                              className="object-contain"
                            />
                          )}
                          <span className={`text-xs font-medium ${message.role === 'user' ? 'opacity-80 text-white' : 'text-amber-500'}`}>
                            {message.role === 'user' ? 'Bạn' : 'Bee Thân Thiện'}
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed text-white">
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2 last:mb-0" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-2 last:mb-0" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            }}
                          >
                            {textContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1c2f3a] px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-white/10 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area Glassmorphism (làm cho nền input đậm hơn) */}
          <div className="bg-[#13232c]/95 backdrop-blur-lg p-3 border-t border-white/10 z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) handleSubmit(e);
              }}
              className="flex items-center gap-2 bg-[#1c2f3a] rounded-full px-4 py-2 border border-white/30 transition-all duration-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/50"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="text-amber-500 transition-colors hover:text-amber-600 disabled:text-gray-300/60"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
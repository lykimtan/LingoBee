import { MessageSquare } from "lucide-react";

interface FloatingAskButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export const FloatingAskButton = ({ onClick, unreadCount = 0 }: FloatingAskButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9997]">
      <button 
        onClick={onClick}
        className="flex items-center gap-2 rounded-full liquid-glass px-5 py-3.5 shadow-2xl transition-all hover:scale-105 hover:bg-white/10"
      >
        <MessageSquare className="h-5 w-5 text-white/70" />
        <span className="text-sm font-semibold text-white">Ask Question (Hỏi đáp)</span>
      </button>
      
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#1c1c1f] animate-bounce pointer-events-none z-10">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

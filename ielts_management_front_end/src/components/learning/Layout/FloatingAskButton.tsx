import { MessageSquare } from "lucide-react";

export const FloatingAskButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button className="flex items-center gap-2 rounded-full liquid-glass px-5 py-3.5 shadow-2xl transition-all hover:scale-105 hover:bg-white/10">
        <MessageSquare className="h-5 w-5 text-white/70" />
        <span className="text-sm font-semibold text-white">Ask Question (Hỏi đáp)</span>
      </button>
    </div>
  );
};

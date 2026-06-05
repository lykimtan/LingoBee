import Image from "next/image";
import { Clock } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  isPending?: boolean;
}

export default function ResultModal({
  isOpen,
  onClose,
  onRetake,
  accuracy,
  correctCount,
  totalQuestions,
  isPending = false,
}: ResultModalProps) {
  if (!isOpen) return null;

  let memeSrc = "/learning/kinchana.jpg";
  if (accuracy >= 80) {
    memeSrc = "/learning/goodjob_meme.jpg";
  } else if (accuracy >= 50) {
    memeSrc = "/learning/fine_meme.jpeg";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1c1c1f] rounded-[2rem] p-8 max-w-sm w-full border border-white/10 shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
        
        <h3 className="text-2xl font-bold text-white text-center">Nộp bài thành công!</h3>
        
        {isPending ? (
          <>
            <div className="w-56 h-56 rounded-2xl overflow-hidden border-4 border-indigo-500/20 shadow-lg shadow-indigo-500/20 relative flex flex-col items-center justify-center bg-indigo-500/10">
              <Clock className="w-20 h-20 text-indigo-400 mb-4 animate-pulse" />
              <p className="text-indigo-300 font-medium text-center px-4">Đang chờ giáo viên chấm điểm</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-white/70 font-medium text-center">Bài làm có chứa tự luận. Bạn sẽ nhận được kết quả sau khi giáo viên chấm xong.</p>
            </div>
          </>
        ) : (
          <>
            {/* Meme Image */}
            <div className="w-56 h-56 rounded-2xl overflow-hidden border-4 border-emerald-500/20 shadow-lg shadow-emerald-500/20 relative">
              <Image
                src={memeSrc}
                alt="Result Meme"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Score Progress */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * accuracy) / 100} style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }} />
                </svg>
                <span className="absolute text-2xl font-bold text-white">{accuracy}%</span>
              </div>
              <p className="text-white/70 font-medium text-center">Bạn đã trả lời đúng <strong className="text-emerald-500">{correctCount}</strong> / {totalQuestions} câu hỏi</p>
            </div>
          </>
        )}
        
        <div className="w-full flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors text-center"
          >
            Xem chi tiết
          </button>
          <button
            onClick={onRetake}
            className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors text-center shadow-lg shadow-emerald-500/20"
          >
            Làm lại bài
          </button>
        </div>

      </div>
    </div>
  );
}

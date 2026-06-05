"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

interface GradingContentProps {
  isLoading: boolean;
  attempt: any | null;
  manualGradingItems: any[];
  activeQuestionIndex: number;
  onChangeQuestion: (index: number) => void;
}

export default function GradingContent({ 
  isLoading, 
  attempt, 
  manualGradingItems, 
  activeQuestionIndex, 
  onChangeQuestion 
}: GradingContentProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!attempt || manualGradingItems.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center text-gray-500">
        Không tìm thấy bài làm tự luận hoặc ghi âm.
      </div>
    );
  }

  const manualGradingItem = manualGradingItems[activeQuestionIndex];
  if (!manualGradingItem) return null;

  const { question, answer, type } = manualGradingItem;
  const isSpeaking = type === "speaking";
  const isEssay = type === "essay";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Tabs / Navigation */}
      {manualGradingItems.length > 1 && (
        <div className="px-8 pt-6 pb-2 border-b border-gray-100 flex-shrink-0 flex gap-4 overflow-x-auto">
          {manualGradingItems.map((item, index) => (
            <button
              key={item.question._id}
              onClick={() => onChangeQuestion(index)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                index === activeQuestionIndex
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Câu {index + 1} ({item.type === "speaking" ? "Speaking" : "Writing"})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header Info */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
          {isSpeaking ? "Speaking Task" : "Writing Task"}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
          {attempt.exerciseId.title}
        </h2>
        {/* Prompt */}
        <div className="flex gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <svg className="w-6 h-6 flex-shrink-0 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-sm md:text-base italic font-serif leading-relaxed">
            "{question.questionText}"
          </div>
        </div>
      </div>

      {/* Content specific to type */}
      <div className="flex-1">
        {isSpeaking && answer.audioRecordUrl && (
          <AudioPlayer url={answer.audioRecordUrl} />
        )}

        {isSpeaking && !answer.audioRecordUrl && (
          <div className="p-10 border-2 border-dashed border-red-200 rounded-2xl bg-red-50 text-red-500 text-center flex flex-col items-center">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Học viên chưa nộp file ghi âm cho câu hỏi này.</p>
          </div>
        )}

        {isEssay && (
          <div className="prose prose-sm max-w-none md:prose-base text-gray-800 leading-relaxed font-serif">
            {answer.essayAnswer ? (
              answer.essayAnswer.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))
            ) : (
              <p className="text-gray-400 italic">Học viên bỏ trống bài viết.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Submission status: {attempt.status}
        </div>
        <div>
          Target: IELTS 7.5+
        </div>
      </div>
    </div>
    </div>
  );
}

// Custom Audio Player component matching the UI mockup
function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(formatTime(audio.currentTime));
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("00:00");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) audioRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (audioRef.current) audioRef.current.currentTime -= 10;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const val = parseFloat(e.target.value);
      audioRef.current.currentTime = (val / 100) * (audioRef.current.duration || 0);
      setProgress(val);
    }
  };

  return (
    <div className="mt-8 px-4 flex flex-col items-center">
      <audio ref={audioRef} src={url} />
      
      {/* Decorative Waveform (Static visual representation for UI match) */}
      <div className="flex items-center justify-center gap-1 h-24 mb-8 opacity-40">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 bg-gray-400 rounded-full" 
            style={{ 
              height: `${Math.max(10, Math.random() * 100)}%`,
              backgroundColor: i < (progress / 100) * 40 ? '#000' : '#cbd5e1'
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <button onClick={skipBackward} className="text-gray-500 hover:text-black transition">
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={togglePlay}
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
        <button onClick={skipForward} className="text-gray-500 hover:text-black transition">
          <RotateCw className="w-6 h-6" />
        </button>
      </div>

      {/* Scrubber */}
      <div className="w-full max-w-lg flex flex-col gap-2">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}

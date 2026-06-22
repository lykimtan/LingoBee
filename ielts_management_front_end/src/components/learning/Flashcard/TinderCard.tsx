"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo, animate } from "motion/react";
import { Flashcard } from "@/services/flashcardService";
import { Volume2, RotateCw } from "lucide-react";
import PronunciationMic from "./PronunciationMic";
import { playAudio } from "@/utils/audioUtils";

const highlightWord = (sentence: string, word: string) => {
  if (!sentence || !word) return sentence;

  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Tìm từ gốc (Case-insensitive)
  const regex = new RegExp(`(${escapedWord})`, 'gi');

  const parts = sentence.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === word.toLowerCase()) {
      return (
        <span key={index} className="font-extrabold text-blue-700 italic underline decoration-blue-500/40 decoration-2 underline-offset-4">
          {part}
        </span>
      );
    }
    return part;
  });
};

interface TinderCardProps {
  card: Flashcard;
  active: boolean; // Is it the top card?
  onSwipe: (direction: 'left' | 'right') => void;
  index: number;
}

export default function TinderCard({ card, active, onSwipe, index }: TinderCardProps) {
  const [flipped, setFlipped] = useState(false);

  // Motion values for swiping
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Color overlay based on drag direction
  const backgroundRed = useTransform(x, [-100, 0], [0.3, 0]);
  const backgroundGreen = useTransform(x, [0, 100], [0, 0.3]);

  // Keyboard events
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua event nếu đang focus vào input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        animate(x, -500, { duration: 1 }).then(() => onSwipe('left'));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        animate(x, 500, { duration: 1 }).then(() => onSwipe('right'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onSwipe, x]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAudio(card.frontText);
  };

  return (
    <motion.div
      className="absolute w-full h-full max-w-md sm:max-w-lg mx-auto aspect-[4/5] preserve-3d cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100 - index,
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{
        scale: active ? 1 : 1 - index * 0.05,
        y: active ? 0 : index * 15,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => setFlipped(!flipped)}
    >
      {/* Front of Card */}
      <motion.div
        className="absolute inset-0 backface-hidden w-full h-full bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <motion.div
          className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{ backgroundColor: "rgba(239, 68, 68, 0)", opacity: backgroundRed }}
        />
        <motion.div
          className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{ backgroundColor: "rgba(34, 197, 94, 0)", opacity: backgroundGreen }}
        />

        <div className="absolute top-6 right-6 text-gray-300">
          <RotateCw className="w-6 h-6" />
        </div>

        <h2 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {card.frontText}
        </h2>

        {card.phonetic && (
          <p className="text-xl text-gray-500 font-mono mb-8">{card.phonetic}</p>
        )}

        <button
          onClick={handlePlayAudio}
          className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
        >
          <Volume2 className="w-7 h-7" />
        </button>
      </motion.div>

      {/* Back of Card */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 backdrop-blur-xl border-2 border-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center overflow-hidden"
        initial={false}
        animate={{ rotateY: flipped ? 0 : -180 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="absolute top-6 right-6 text-gray-400">
          <RotateCw className="w-6 h-6" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-start w-full overflow-y-auto hide-scrollbar pb-8 pt-10">

          <div className="flex items-center gap-3 mb-4 mt-auto flex-shrink-0">
            <h3 className="text-3xl font-bold text-gray-900">{card.frontText}</h3>
            {card.partOfSpeech && (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full italic">
                {card.partOfSpeech}
              </span>
            )}
          </div>

          <div className="w-16 h-1 bg-blue-500 rounded-full mb-6 flex-shrink-0"></div>

          <p className="text-2xl text-blue-900 font-medium mb-6 flex-shrink-0 px-2">
            {card.backText}
          </p>

          {card.exampleSentence && (
            <div className="bg-white/60 p-5 rounded-2xl mb-6 w-full text-left text-gray-700 border border-white shadow-sm text-lg flex-shrink-0">
              "{highlightWord(card.exampleSentence, card.frontText)}"
            </div>
          )}

          {card.synonyms && card.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 w-full flex-shrink-0">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mr-1">Đồng nghĩa:</span>
              {card.synonyms.map((syn, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                  {syn}
                </span>
              ))}
            </div>
          )}

          {card.imageUrl && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 mt-auto border-4 border-white shadow-md flex-shrink-0 bg-gray-100">
              <img src={card.imageUrl} alt={card.frontText} className="w-full h-full object-cover" />
            </div>
          )}

        </div>

        {/* Pronunciation AI Check */}
        <div className="w-full pt-4 border-t border-gray-200/50 flex justify-center" onClick={e => e.stopPropagation()}>
          <PronunciationMic word={card.frontText} />
        </div>

      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, CheckCircle2, Square } from "lucide-react";
import { toast } from "react-toastify";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechToken } from "@/utils/azureSpeechToken";

interface PronunciationMicProps {
  word: string;
}

export default function PronunciationMic({ word }: PronunciationMicProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number;
    words?: any[];
  } | null>(null);
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);

  const handleRecord = async () => {
    // Nếu ĐANG THU ÂM, thì nhấn vào sẽ DỪNG THU ÂM và bắt đầu xử lý
    if (isRecording) {
      console.log("User clicked STOP. Stopping recognition...");
      if (recognizerRef.current) {
        setIsRecording(false);
        setIsProcessing(true);
        // SDK sẽ gọi event sessionStopped sau khi stop thành công
        recognizerRef.current.stopContinuousRecognitionAsync();
      }
      return;
    }
    
    if (isProcessing) return;
    
    if (!word) {
      toast.error("Không có từ vựng để đánh giá");
      return;
    }
    
    setIsRecording(true);
    setScore(null);
    setFeedback(null);
    
    try {
      console.log("Fetching token...");
      const { token, region } = await getSpeechToken();
      console.log("Token fetched successfully. Region:", region);
      
      console.log("Initializing SpeechConfig...");
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";
      
      console.log("Initializing AudioConfig...");
      // Auto-detect default microphone
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      
      console.log("Initializing PronunciationAssessmentConfig for word:", word);
      // Xóa dấu câu để tránh lỗi chấm điểm
      const cleanWord = word.replace(/[^\w\s]/gi, '');
      const pronConfig = new sdk.PronunciationAssessmentConfig(
        cleanWord,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true
      );
      pronConfig.enableProsodyAssessment = true;
      pronConfig.phonemeAlphabet = "IPA";
      
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;
      
      let finalPronResult: sdk.PronunciationAssessmentResult | null = null;
      let recognizedText = "";

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          console.log("Speech recognized snippet:", e.result.text);
          recognizedText += e.result.text + " ";
          const res = sdk.PronunciationAssessmentResult.fromResult(e.result);
          if (res && res.pronunciationScore > 0) {
            // Lấy kết quả tốt nhất hoặc ghi đè
            finalPronResult = res;
          }
        }
      };

      recognizer.canceled = (s, e) => {
        console.error("Recognizer canceled:", e.reason, e.errorDetails);
        if (e.reason === sdk.CancellationReason.Error) {
          toast.error("Lỗi nhận dạng: " + e.errorDetails);
        }
      };

      recognizer.sessionStopped = (s, e) => {
        console.log("Session stopped automatically or manually.");
        setIsRecording(false);
        setIsProcessing(true);
        
        recognizer.stopContinuousRecognitionAsync(() => {
          console.log("=== AZURE SPEECH FINAL RESULT ===");
          console.log("Recognized Text:", recognizedText);
          console.log("Pronunciation Result:", finalPronResult);
          console.log("=================================");

          if (finalPronResult) {
            const finalScore = Math.round(finalPronResult.pronunciationScore);
            setScore(finalScore);
            setFeedback({
              accuracy: Math.round(finalPronResult.accuracyScore),
              fluency: Math.round(finalPronResult.fluencyScore),
              completeness: Math.round(finalPronResult.completenessScore),
              words: finalPronResult.detailResult?.Words || [],
            });
            
            if (finalScore >= 80) {
              toast.success(`Phát âm tuyệt vời! (${finalScore}%)`);
            } else if (finalScore >= 60) {
              toast.info(`Khá tốt, hãy cố gắng thêm nhé! (${finalScore}%)`);
            } else {
              toast.warning(`Bạn cần luyện tập từ này nhiều hơn (${finalScore}%)`);
            }
          } else {
            if (recognizedText.trim().length > 0) {
              toast.warning("Hệ thống nghe được âm thanh nhưng không thể chấm điểm từ này.");
            } else {
              toast.error("Không nghe rõ bạn nói gì (Không có âm thanh).");
            }
          }
          
          setIsProcessing(false);
          recognizer.close();
          recognizerRef.current = null;
        });
      };

      console.log("Starting startContinuousRecognitionAsync...");
      // Bắt đầu thu âm liên tục cho đến khi user bấm stop
      recognizer.startContinuousRecognitionAsync();
      
    } catch (error) {
      console.error("Error in handleRecord try-catch:", error);
      toast.error("Lỗi cấu hình Azure Speech hoặc Token.");
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up the recognizer if component unmounts while recording
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleRecord}
        disabled={isProcessing}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' 
            : isProcessing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : score && score >= 80
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 shadow-md'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isRecording ? (
          <Square className="w-5 h-5 fill-current" />
        ) : score && score >= 80 ? (
          <CheckCircle2 className="w-7 h-7" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {isRecording && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>
      
      <p className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-wider">
        {isRecording ? "Bấm để dừng" : isProcessing ? "AI Đang chấm..." : "AI Pronunciation"}
      </p>

      {feedback && !isRecording && !isProcessing && (
        <div className="w-full max-w-[280px] mt-4 flex flex-col items-center">
          {/* Detailed Phoneme Breakdown */}
          {feedback.words && feedback.words.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {feedback.words.map((w: any, idx: number) => {
                const errType = w.PronunciationAssessment?.ErrorType;
                if (errType === "Omission") {
                  return (
                    <span key={idx} className="text-sm font-semibold text-gray-400 line-through px-1" title="Bỏ sót (Omission)">
                      {w.Word}
                    </span>
                  );
                }
                
                // Hiển thị từng âm vị nếu có
                if (w.Phonemes && w.Phonemes.length > 0) {
                  return (
                    <div key={idx} className="flex gap-[2px] items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {w.Phonemes.map((p: any, pIdx: number) => {
                        const pScore = p.PronunciationAssessment?.AccuracyScore || 0;
                        let pColor = 'text-red-500';
                        if (pScore >= 80) pColor = 'text-green-600';
                        else if (pScore >= 60) pColor = 'text-orange-500';

                        return (
                          <span key={pIdx} className={`text-sm font-bold ${pColor}`} title={`Âm: /${p.Phoneme}/ - Điểm: ${Math.round(pScore)}`}>
                            {p.Phoneme}
                          </span>
                        );
                      })}
                    </div>
                  );
                }

                // Fallback nếu không có phonemes
                const wScore = w.PronunciationAssessment?.AccuracyScore || 0;
                let wColor = 'text-red-500';
                if (wScore >= 80) wColor = 'text-green-600';
                else if (wScore >= 60) wColor = 'text-orange-500';
                
                return (
                  <span key={idx} className={`text-sm font-bold ${wColor}`}>
                    {w.Word}
                  </span>
                );
              })}
            </div>
          )}

          {/* 3 Overview Metrics */}
          <div className="w-full flex justify-around items-center px-3 py-2 bg-white/60 rounded-xl border border-blue-100 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Phát âm</span>
              <span className={`text-sm font-bold ${feedback.accuracy >= 80 ? 'text-green-600' : feedback.accuracy >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                {feedback.accuracy}%
              </span>
            </div>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Trôi chảy</span>
              <span className={`text-sm font-bold ${feedback.fluency >= 80 ? 'text-green-600' : feedback.fluency >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                {feedback.fluency}%
              </span>
            </div>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Mạch lạc</span>
              <span className={`text-sm font-bold ${feedback.completeness >= 80 ? 'text-green-600' : feedback.completeness >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                {feedback.completeness}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

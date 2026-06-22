export const playAudio = (text: string, lang: string = 'en-US') => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Hủy bỏ các âm thanh đang đọc dở (nếu người dùng bấm liên tục)
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Tùy chỉnh (có thể điều chỉnh nếu cần)
    // utterance.rate = 1; // Tốc độ đọc (0.1 đến 10)
    // utterance.pitch = 1; // Độ cao của giọng nói (0 đến 2)
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Trình duyệt của bạn không hỗ trợ Web Speech API.');
  }
};

export interface AIAssessmentWordsProps {
  words: any[];
}

export function AIAssessmentWords({ words }: AIAssessmentWordsProps) {
  if (!words || words.length === 0) return null;

  return (
    <div className="pt-3 mt-3 border-t border-gray-100">
      <span className="font-medium text-gray-800 block mb-2 text-sm">Chi tiết từng từ:</span>
      <div className="flex flex-wrap gap-1.5">
        {words.map((wordObj: any, wIdx: number) => {
          let colorClass = "text-gray-700 bg-gray-100 border-gray-200";
          if (wordObj.errorType === "None" || wordObj.accuracyScore >= 80) {
            colorClass = "text-green-700 bg-green-50 border-green-200";
          } else if (wordObj.accuracyScore >= 50) {
            colorClass = "text-amber-700 bg-amber-50 border-amber-200";
          } else {
            colorClass = "text-red-700 bg-red-50 border-red-200";
          }
          
          return (
            <span 
              key={wIdx} 
              className={`px-2 py-1 rounded text-xs border ${colorClass}`} 
              title={`Độ chính xác: ${wordObj.accuracyScore || 0}%${wordObj.errorType && wordObj.errorType !== 'None' ? ` - Lỗi: ${wordObj.errorType}` : ''}`}
            >
              {wordObj.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { learningService, VideoResources } from '@/services/learningService';
import { FileText, Download, Link as LinkIcon, Loader2 } from 'lucide-react';
import PdfImageViewer from "@/components/public/PdfImageViewer";

interface ResourcesTabProps {
  videoId: string;
  onSelectExercise?: (exerciseId: string) => void;
}

export const ResourcesTab = ({ videoId, onSelectExercise }: ResourcesTabProps) => {
  const [resources, setResources] = useState<VideoResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await learningService.getVideoResources(videoId);
        if (response.success && response.data) {
          setResources(response.data);
        } else {
          setError("Failed to load resources");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchResources();
    }
  }, [videoId]);

  if (loading) {
    return <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>;
  }

  if (error) {
    return <div className="py-6 text-red-400 text-sm">{error}</div>;
  }

  const hasMaterial = resources?.materialUrl;
  const hasExercises = resources?.exercises && resources.exercises.length > 0;

  if (!hasMaterial && !hasExercises) {
    return <div className="py-6 text-white/60 text-sm">Chưa có tài liệu cho bài học này.</div>;
  }

  return (
    <div className="py-6 space-y-6">
      {hasMaterial && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-lg shrink-0">
                <FileText className="w-6 h-6 text-[#f4e900]" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">
                  {resources.materialName || "Tài liệu bài giảng"}
                </h4>
                <p className="text-white/50 text-sm">Tài liệu tham khảo (PDF)</p>
              </div>
            </div>
            <a
              href={resources.materialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium bg-[#f4e900] text-black px-4 py-2 rounded-lg hover:bg-[#f4e900]/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden h-[600px] flex items-center justify-center relative">
            <PdfImageViewer pdfUrl={resources.materialUrl} />
          </div>
        </div>
      )}

      {hasExercises && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-2">Bài tập thực hành</h3>
          <div className="grid gap-3">
            {resources.exercises.map((exercise, index) => (
              <div key={exercise._id || index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg shrink-0">
                    <LinkIcon className="w-4 h-4 text-[#f4e900]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {exercise.title || `Bài tập ${index + 1}`}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => onSelectExercise && exercise._id && onSelectExercise(exercise._id)}
                  className="text-sm font-medium bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Bắt đầu làm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

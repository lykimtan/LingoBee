"use client";
import dynamic from 'next/dynamic';
import 'plyr-react/plyr.css';

const Plyr = dynamic(() => import('plyr-react').then((mod) => mod.Plyr as any), { ssr: false });

export const CoursePreviewVideo = ({
  previewVideoUrl
}: {
  previewVideoUrl?: string;
}) => {
  // Default to a sample video if none provided
  const videoSource = previewVideoUrl || "https://www.youtube.com/watch?v=bTqVqk7FSmY";
  const isYoutube = videoSource.includes("youtube.com") || videoSource.includes("youtu.be");

  const plyrProps = {
    source: {
      type: "video",
      sources: [
        {
          src: videoSource,
          provider: isYoutube ? 'youtube' : 'html5',
        },
      ],
    },
    options: {
      autoplay: false,
    },
  } as any;

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
      <Plyr {...plyrProps} />
    </div>
  );
};

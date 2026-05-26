"use client";

import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import { CourseVideo } from "@/types";

const Plyr = dynamic(async () => (await import("plyr-react")).Plyr, {
  ssr: false,
});

interface VideoExercisePlayerProps {
  video: CourseVideo | null;
  isLoading: boolean;
  error: string | null;
}

export default function VideoExercisePlayer({
  video,
  isLoading,
  error,
}: VideoExercisePlayerProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{video?.title}</h2>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-sm font-medium text-gray-500">
          Dang tai video...
        </div>
      )}

      {!error && !isLoading && video && (
        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="aspect-video w-full bg-black">
            <Plyr
              source={{
                type: "video",
                sources: [
                  {
                    src: video.videoUrl,
                  },
                ],
              }}
              options={{
                autoplay: false,
                controls: [
                  "play-large",
                  "play",
                  "progress",
                  "current-time",
                  "mute",
                  "volume",
                  "captions",
                  "settings",
                  "pip",
                  "airplay",
                  "fullscreen",
                ],
              }}
            />
          </div>
        </div>
      )}

      {video?.description && (
        <div
           className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: video.description }}
        />
      )}
    </section>
  );
}

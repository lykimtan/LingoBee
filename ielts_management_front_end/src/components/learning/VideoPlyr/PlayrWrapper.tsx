"use client";

import { Plyr, APITypes } from "plyr-react";
import "plyr/dist/plyr.css";
import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";

interface PlayrWrapperProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    initialTime?: number;
    onProgressUpdate?: (currentTime: number, duration: number, isCompleted: boolean) => void;
}

const PLYR_OPTIONS = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
};

export interface PlayrWrapperRef {
    pause: () => void;
    play: () => void;
    getCurrentTime: () => number;
    seekTo: (time: number) => void;
}

export const PlayrWrapper = forwardRef<PlayrWrapperRef, PlayrWrapperProps>(({ videoUrl, thumbnailUrl, initialTime, onProgressUpdate }, parentRef) => {
    const ref = useRef<APITypes>(null);

    useImperativeHandle(parentRef, () => ({
        pause: () => {
            const plyr = ref.current?.plyr as any;
            if (plyr && typeof plyr.pause === "function") plyr.pause();
        },
        play: () => {
            const plyr = ref.current?.plyr as any;
            if (plyr && typeof plyr.play === "function") plyr.play();
        },
        getCurrentTime: () => {
            const plyr = ref.current?.plyr as any;
            return plyr ? plyr.currentTime : 0;
        },
        seekTo: (time: number) => {
            const plyr = ref.current?.plyr as any;
            if (plyr) {
                plyr.currentTime = time;
                if (typeof plyr.play === "function") plyr.play();
            }
        }
    }));

    useEffect(() => {
        if (!onProgressUpdate) return;

        let plyrInstance: any = null;
        let lastSyncTime = 0;
        let pollInterval: NodeJS.Timeout;

        const handleTimeUpdate = () => {
            if (!plyrInstance) return;
            const now = Date.now();
            if (now - lastSyncTime > 60000) {
                lastSyncTime = now;
                onProgressUpdate(Math.floor(plyrInstance.currentTime), Math.floor(plyrInstance.duration), false);
            }
        };

        const handleEnded = () => {
            if (!plyrInstance) return;
            onProgressUpdate(Math.floor(plyrInstance.currentTime), Math.floor(plyrInstance.duration), true);
        };

        const handlePause = () => {
            if (!plyrInstance) return;
            onProgressUpdate(Math.floor(plyrInstance.currentTime), Math.floor(plyrInstance.duration), false);
        };

        const bindEvents = () => {
            const plyr = ref.current?.plyr as any;
            if (plyr && typeof plyr.on === "function") {
                plyrInstance = plyr;
                clearInterval(pollInterval);

                // Seek to initial time if provided
                if (initialTime && initialTime > 0) {
                    // Try to seek immediately, or wait for loadedmetadata
                    plyr.once("loadedmetadata", () => {
                        plyr.currentTime = initialTime;
                    });
                    // Fallback if already loaded
                    if (plyr.duration > 0) {
                        plyr.currentTime = initialTime;
                    }
                }

                plyr.on("timeupdate", handleTimeUpdate);
                plyr.on("ended", handleEnded);
                plyr.on("pause", handlePause);
            }
        };

        pollInterval = setInterval(bindEvents, 500);
        bindEvents(); // Try immediately

        return () => {
            clearInterval(pollInterval);
            try {
                if (plyrInstance && typeof plyrInstance.off === "function") {
                    plyrInstance.off("timeupdate", handleTimeUpdate);
                    plyrInstance.off("ended", handleEnded);
                    plyrInstance.off("pause", handlePause);
                }
            } catch (e) {
                // Ignore if plyr instance is already destroyed by plyr-react
            }
        };
    }, [videoUrl, onProgressUpdate]);

    const plyrSource = useMemo(() => ({
        type: "video" as const,
        sources: [
            {
                src: videoUrl || "https://cdn.plyr.io/static/blank.mp4",
                type: "video/mp4",
            },
        ],
        poster: thumbnailUrl,
    }), [videoUrl, thumbnailUrl]);

    return (
        <div className="w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black/40 backdrop-blur-2xl relative aspect-video">
            <Plyr
                ref={ref}
                source={plyrSource}
                options={PLYR_OPTIONS}
            />
        </div>
    );
});

PlayrWrapper.displayName = "PlayrWrapper";

/**
 * VideoBackground Component
 * Fullscreen looping background video element
 */

export const VideoBackground = () => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src="/videos/hero-background.mp4" type="video/mp4" />
    </video>
  );
};

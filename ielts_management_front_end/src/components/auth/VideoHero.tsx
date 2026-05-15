"use client";

export const VideoHero = () => {
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="/videos/leftsideAuth.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Cinematic Gradient Overlay - left to right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-black/75" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-12">
        {/* Top-Left Logo */}
        <div className="animate-fade-in">
          <h1 className="text-white font-semibold text-xl tracking-wider">
            LingoBee
          </h1>
        </div>

        {/* Bottom-Left Hero Text Block */}
        <div className="animate-fade-in-delay max-w-lg pb-8">
          {/* Small Label */}
          <p className="text-xs uppercase tracking-widest opacity-70 text-gray-300 mb-6">
            Precision Language Intelligence
          </p>

          {/* Main Headline with italic "fluency" */}
          <h2 className="text-4xl md:text-5xl xl:text-6xl leading-tight text-white font-light">
            Refine your{" "}
            <span
              style={{ fontFamily: "'Instrument Serif', serif" }}
              className="italic font-semibold"
            >
              fluency
            </span>
            {" "}in our digital laboratory.
          </h2>
        </div>
      </div>
    </div>
  );
};

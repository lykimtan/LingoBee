/**
 * Hero Section Component
 * Centered hero with cinematic typography and animations
 */

"use client";

export const HeroSection = () => {
  return (
    <section className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-24">
      {/* Vertically Centered Content Column */}
      <div className="flex flex-col items-start max-w-4xl w-full">
        {/* First Heading Line */}
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] font-normal text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise
        </h1>

        {/* Second Heading Line */}
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] font-normal text-muted-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          through the silence.
        </h1>

        {/* Subtext */}
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-12 leading-relaxed">
          {`Mọi hành trình vạn dặm đều bắt đầu bằng một bước chân. Hãy để LingoBee trở thành người bạn đồng hành đáng tin cậy trên con đường chinh phục IELTS của bạn, biến những ước mơ ngôn ngữ thành hiện thực.`}
        </p>

        {/* CTA Button */}
        <button className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer">
          Begin Journey
        </button>

        {/* Caption */}
        <p className="animate-fade-rise-delay-2 text-muted-foreground text-xs tracking-widest uppercase mt-6">
          Established 2026 | LingoBee® - All Rights Reserved
        </p>
      </div>
    </section>
  );
};

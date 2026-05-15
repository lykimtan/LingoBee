"use client";

import { useState, useEffect, useRef } from "react";

const stats = [
  {
    number: "8+",
    label: "Năm hoạt động",
    numericValue: 8,
  },
  {
    number: "10+",
    label: "Cơ sở trên toàn quốc",
    numericValue: 10,
  },
  {
    number: "200+",
    label: "Học viên xuất sắc đạt IELTS 8.0+",
    numericValue: 200,
  },
  {
    number: "100%",
    label: "Giáo viên chuyên môn chất lượng cao",
    numericValue: 100,
    isSuffix: "%",
  },
  {
    number: "5,000+",
    label: "Học viên cần dịch",
    numericValue: 5000,
    format: true,
  },
  {
    number: "10+",
    label: "Top Đối tác bạch kim của IDP và British Council Vietnam",
    numericValue: 10,
  },
];

const CounterNumber = ({
  numericValue,
  isSuffix,
  format,
  isVisible,
}: {
  numericValue: number;
  isSuffix?: string;
  format?: boolean;
  isVisible: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = numericValue / (duration / 50);

    const interval = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [numericValue, isVisible]);

  const displayValue = () => {
    if (format) {
      return count.toLocaleString("vi-VN");
    }
    return count;
  };

  return (
    <>
      {displayValue()}
      {isSuffix}
      <span className="text-primary/60">+</span>
    </>
  );
};

export const ProgramStats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 w-full py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-normal tracking-[-1.5px] text-foreground transition-all duration-1000 ${
              isVisible ? "animate-fade-rise opacity-100" : "opacity-0"
            }`}
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Chương trình{" "}
            <span className="text-muted-foreground">đào tạo</span>
          </h2>
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-normal tracking-[-1.5px] text-muted-foreground transition-all duration-1000 ${
              isVisible ? "animate-fade-rise opacity-100" : "opacity-0"
            }`}
            style={{ fontFamily: "'Instrument Serif', serif", animationDelay: isVisible ? "0.2s" : "0s" }}
          >
            chất lượng cao
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl p-8 backdrop-blur-sm border border-border/30 hover:border-border/60 hover:scale-105 transition-all duration-300 ${
                isVisible ? "animate-fade-rise-delay opacity-100" : "opacity-0"
              } ${
                index % 3 === 1 && index < 3
                  ? "lg:translate-y-0"
                  : index >= 3
                    ? "lg:translate-y-0"
                    : ""
              }`}
              style={{
                animationDelay: isVisible ? `${0.1 * (index + 1)}s` : "0s",
              }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-35">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/homepage/backgroundSumarize.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-background/80 via-background/55 to-background/75" />

              <div className="relative z-10">
              {/* Number */}
              <div className="mb-6">
                <p className="text-5xl sm:text-6xl font-bold text-primary tracking-tighter">
                  {isVisible ? (
                    <CounterNumber
                      numericValue={stat.numericValue}
                      isSuffix={stat.isSuffix}
                      format={stat.format}
                      isVisible={isVisible}
                    />
                  ) : (
                    stat.number
                  )}
                </p>
              </div>

              {/* Label */}
              <p className="text-muted-foreground text-base leading-relaxed">
                {stat.label}
              </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

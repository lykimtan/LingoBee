/**
 * Target Score Mastery Component
 * Shows target IELTS band score and progress
 */

// using video background instead of next/image
import Image from "next/image";
interface TargetScoreMasteryProps {
  currentScore?: number;
  targetScore?: number;
  currentProgress?: number;
  globalRanking?: string;
}

export const TargetScoreMastery = ({
  currentScore = 7.5,
  targetScore = 8.5,
  currentProgress = 88,
  globalRanking = "Top 5% candidates",
}: TargetScoreMasteryProps) => {
  const bands = [
    { label: "BAND 6.0", value: 6.0, completed: true },
    { label: "BAND 7.0", value: 7.0, completed: true },
    { label: "BAND 8.0", value: 8.0, completed: false },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm">
      {/* Background Video - Flipped Horizontally */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden rounded-2xl">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={{ transform: "scaleX(-1)" }}
        >
          <source src="/profile/backgroundVideo.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-1">Mục tiêu điểm IELTS</h3>
            <p className="text-muted-foreground text-sm">{globalRanking}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">{currentScore}</span>
              <span className="text-2xl text-muted-foreground">/{targetScore}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Tiến độ hiện tại</span>
            <span className="text-xs font-semibold text-foreground">{currentProgress}% ĐÃ HOÀN THÀNH</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-gradient-to-r from-white/5 to-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Band Milestones */}
        <div className="flex gap-4">
          {bands.map((band) => (
            <div key={band.value} className="flex-1">
              <div
                className={`text-center p-3 rounded-lg transition-all ${
                  band.completed
                    ? "bg-white/10 border border-white/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <p className="text-xs font-semibold text-muted-foreground mb-1">{band.label}</p>
                {band.completed && (
                  <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                     <Image
                      src={"/profile/checked.gif"}
                      alt={band.label}
                      width={20}
                      height={20}
                      unoptimized
                      sizes="20px"
                      className="object-contain rounded-md inline-block"
                    /> 
                    Đã hoàn thành
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

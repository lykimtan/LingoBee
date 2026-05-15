/**
 * Skill Proficiency Component
 * Shows proficiency levels across different skills with radar chart
 */
import Image from "next/image";
interface SkillData {
  name: string;
  level: number; // 0-100
  bandScore?: number; // IELTS band score
  color: string;
}

interface SkillProficiencyProps {
  skills?: SkillData[];
}

const defaultSkills: SkillData[] = [
  { name: "Reading", level: 85, bandScore: 8.5, color: "#60a5fa" },
  { name: "Writing", level: 65, bandScore: 6.5, color: "#ec4899" },
  { name: "Speaking", level: 65, bandScore: 6.5, color: "#f97316" },
  { name: "Listening", level: 75, bandScore: 7.5, color: "#3b82f6" },
];

export const SkillProficiency = ({ skills = defaultSkills }: SkillProficiencyProps) => {
  // Find strongest and weakest skills
  const strongest = skills.reduce((prev, current) =>
    current.level > prev.level ? current : prev
  );
  const weakest = skills.reduce((prev, current) =>
    current.level < prev.level ? current : prev
  );

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-xl font-semibold">Skill Proficiency</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
           <Image
                      src={"/profile/progress.gif"}
                      alt="Refresh"
                      width={40}
                      height={40}
                      unoptimized
                      sizes="40px"
                      className="object-contain rounded-md"
                    />
        </button>
      </div>

      {/* Radar Chart */}
      <div className="flex items-center justify-center mb-12">
        <svg
          viewBox="0 0 320 320"
          className="w-full max-w-xs"
          style={{ maxWidth: "320px", height: "auto" }}
        >
          {/* Background grid circles */}
          {[1, 2, 3, 4, 5].map((i) => (
            <circle
              key={`grid-${i}`}
              cx="160"
              cy="160"
              r={30 * i}
              fill="none"
              stroke="rgb(255, 255, 255)"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}

          {/* Polygon for 4 skills - Reading(top), Writing(right), Speaking(bottom), Listening(left) */}
          <g>
            {/* Polygon filled area */}
            <polygon
              points={`
                ${160 + (skills[0].level / 100) * 100 * Math.sin(0)},${160 - (skills[0].level / 100) * 100 * Math.cos(0)}
                ${160 + (skills[1].level / 100) * 100 * Math.sin((Math.PI * 2) / 4)},${160 - (skills[1].level / 100) * 100 * Math.cos((Math.PI * 2) / 4)}
                ${160 + (skills[2].level / 100) * 100 * Math.sin((Math.PI * 2) / 2)},${160 - (skills[2].level / 100) * 100 * Math.cos((Math.PI * 2) / 2)}
                ${160 + (skills[3].level / 100) * 100 * Math.sin((Math.PI * 2 * 3) / 4)},${160 - (skills[3].level / 100) * 100 * Math.cos((Math.PI * 2 * 3) / 4)}
              `}
              fill="rgb(59, 130, 246)"
              fillOpacity="0.15"
              stroke="rgb(147, 197, 253)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Axis lines */}
            {skills.map((_, index) => {
              const angle = (index * Math.PI * 2) / 4 - Math.PI / 2;
              const distance = 130;
              const x = 160 + distance * Math.cos(angle);
              const y = 160 + distance * Math.sin(angle);
              return (
                <line
                  key={`axis-${index}`}
                  x1="160"
                  y1="160"
                  x2={x}
                  y2={y}
                  stroke="rgb(255, 255, 255)"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Skill Labels on axes */}
            {skills.map((skill, index) => {
              const angle = (index * Math.PI * 2) / 4 - Math.PI / 2;
              const distance = 155;
              const x = 160 + distance * Math.cos(angle);
              const y = 160 + distance * Math.sin(angle);

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgb(209, 213, 219)"
                  fontSize="12"
                  fontWeight="600"
                  letterSpacing="0.05em"
                >
                  {skill.name}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend with Strongest and Attention */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strongest */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Strongest
          </p>
          <p className="text-lg font-bold text-blue-300">
            {strongest.name} {strongest.bandScore ? `(${strongest.bandScore})` : `(${strongest.level}%)`}
          </p>
        </div>

        {/* Attention */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Attention
          </p>
          <p className="text-lg font-bold text-orange-300">
            {weakest.name} {weakest.bandScore ? `(${weakest.bandScore})` : `(${weakest.level}%)`}
          </p>
        </div>
      </div>
    </div>
  );
};

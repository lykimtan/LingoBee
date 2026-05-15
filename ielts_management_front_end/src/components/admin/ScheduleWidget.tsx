import Image from "next/image";

export function ScheduleWidget() {
  const days = [
    { day: "Mon", date: "22" },
    { day: "Tue", date: "23" },
    { day: "Wed", date: "24", active: true },
    { day: "Thu", date: "25" },
    { day: "Fri", date: "26" },
    { day: "Sat", date: "27" },
  ];

  const times = ["8:00 am", "9:00 am", "10:00 am", "11:00 am"];

  return (
    <div className="flex flex-col rounded-[2rem] bg-white/5 p-6 shadow-sm backdrop-blur-md border border-white/10">
      <div className="mb-6 flex items-center justify-between">
        <button className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/20 transition">
          August
        </button>
        <h3 className="font-medium text-white/90">September 2024</h3>
        <button className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/20 transition">
          October
        </button>
      </div>

      <div className="relative mt-2 overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="ml-16 grid grid-cols-6 gap-4">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`text-xs ${d.active ? "font-medium text-[#ffb800]" : "text-white/40"}`}>
                  {d.day}
                </span>
                <span className={`mt-1 text-sm ${d.active ? "font-medium text-white" : "text-white/60"}`}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="mt-4 relative">
            {/* Vertical lines */}
            <div className="absolute inset-0 ml-16 grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-full w-full border-l border-dashed border-white/10"></div>
              ))}
            </div>

            {/* Rows */}
            {times.map((time, idx) => (
              <div key={idx} className="relative flex h-16 items-start">
                <div className="w-16 flex-shrink-0 text-xs text-white/40 pt-2">{time}</div>
              </div>
            ))}

            {/* Event blocks */}
            <div className="absolute top-[4.5rem] left-[calc(4rem+16.66%*1)] w-[calc(16.66%*2)] px-2">
              <div className="flex h-14 items-center justify-between rounded-xl bg-[#0a1a1c] p-3 text-white border border-white/10 shadow-lg">
                <div>
                  <h4 className="text-[11px] font-medium text-white/90">Teachers Sync</h4>
                  <p className="text-[9px] text-white/50">Discuss progress</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full border border-[#0a1a1c] bg-gray-400"></div>
                  <div className="h-5 w-5 rounded-full border border-[#0a1a1c] bg-gray-500"></div>
                  <div className="h-5 w-5 rounded-full border border-[#0a1a1c] bg-gray-600"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-[8.5rem] left-[calc(4rem+16.66%*3)] w-[calc(16.66%*1.5)] px-2">
              <div className="flex h-14 items-center justify-between rounded-xl bg-[#1f6f5e] p-3 shadow-lg border border-[#1f6f5e]/50 text-white">
                <div>
                  <h4 className="text-[11px] font-medium text-white">Placement Test</h4>
                  <p className="text-[9px] text-white/70">New students</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full border border-[#1f6f5e] bg-gray-200"></div>
                  <div className="h-5 w-5 rounded-full border border-[#1f6f5e] bg-gray-300"></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

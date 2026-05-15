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
    <div className="flex flex-col rounded-[2rem] bg-white/60 p-6 shadow-sm backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <button className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
          August
        </button>
        <h3 className="font-medium text-gray-900">September 2024</h3>
        <button className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
          October
        </button>
      </div>

      <div className="relative mt-2 overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="ml-16 grid grid-cols-6 gap-4">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`text-xs ${d.active ? "font-medium text-gray-900" : "text-gray-500"}`}>
                  {d.day}
                </span>
                <span className={`mt-1 text-sm ${d.active ? "font-medium text-gray-900" : "text-gray-500"}`}>
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
                <div key={i} className="h-full w-full border-l border-dashed border-gray-200"></div>
              ))}
            </div>

            {/* Rows */}
            {times.map((time, idx) => (
              <div key={idx} className="relative flex h-16 items-start">
                <div className="w-16 flex-shrink-0 text-xs text-gray-500 pt-2">{time}</div>
                <div className="relative flex-1">
                   {/* Horizontal line */}
                   {/* <div className="absolute top-4 left-0 right-0 border-t border-dashed border-gray-200 -z-10"></div> */}
                </div>
              </div>
            ))}

            {/* Event blocks */}
            <div className="absolute top-[4.5rem] left-[calc(4rem+16.66%*1)] w-[calc(16.66%*2)] px-2">
              <div className="flex h-14 items-center justify-between rounded-xl bg-gray-900 p-3 text-white">
                <div>
                  <h4 className="text-[11px] font-medium">Teachers Sync</h4>
                  <p className="text-[9px] text-gray-400">Discuss progress</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full border border-gray-800 bg-gray-400"></div>
                  <div className="h-5 w-5 rounded-full border border-gray-800 bg-gray-500"></div>
                  <div className="h-5 w-5 rounded-full border border-gray-800 bg-gray-600"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-[8.5rem] left-[calc(4rem+16.66%*3)] w-[calc(16.66%*1.5)] px-2">
              <div className="flex h-14 items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-gray-100">
                <div>
                  <h4 className="text-[11px] font-medium text-gray-900">Placement Test</h4>
                  <p className="text-[9px] text-gray-500">New students</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full border border-white bg-gray-200"></div>
                  <div className="h-5 w-5 rounded-full border border-white bg-gray-300"></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

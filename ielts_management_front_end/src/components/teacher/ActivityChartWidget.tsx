import { ArrowUpRight, Play, Pause, Clock } from "lucide-react";

export function ActivityChartWidget() {
  const chartData = [
    { day: "M", value: 30 },
    { day: "T", value: 45 },
    { day: "W", value: 20 },
    { day: "T", value: 60 },
    { day: "F", value: 80, active: true },
    { day: "S", value: 10 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Enrollments Chart */}
      <div className="flex flex-col justify-between rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Enrollments</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-light text-gray-900">24</span>
              <span className="mb-1 text-xs text-gray-500">Students this week</span>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
            <ArrowUpRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="mt-8 flex h-32 items-end justify-between px-2 relative">
           {/* Center dashed line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>

          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10">
              <div className="relative flex w-2 justify-center">
                {d.active && (
                  <div className="absolute -top-8 rounded-full bg-[#ffb800] px-2 py-1 text-[10px] font-medium whitespace-nowrap">
                    24 Enrolls
                  </div>
                )}
                <div
                  className={`w-2 rounded-full ${
                    d.active ? "bg-[#ffb800]" : "bg-gray-800"
                  }`}
                  style={{ height: `${d.value}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
        <div className="w-full flex items-start justify-between">
           <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
           <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
            <ArrowUpRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        <div className="relative mt-4 flex h-40 w-40 items-center justify-center">
           {/* Circular dashed border */}
          <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="6"
              strokeDasharray="4 4"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="#ffb800"
              strokeWidth="6"
              strokeDasharray="300 440"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900">12:35</div>
            <div className="text-[10px] text-gray-500">Live Classes</div>
          </div>
        </div>

        <div className="mt-4 flex w-full justify-between items-center px-4">
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
              <Play className="h-4 w-4 text-gray-600" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
              <Pause className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800">
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

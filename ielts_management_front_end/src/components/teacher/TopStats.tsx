import { Users, GraduationCap, BookOpen, Clock } from "lucide-react";

export function TopStats() {
  const stats = [
    { label: "Active Students", value: "342", icon: Users },
    { label: "Total Teachers", value: "48", icon: GraduationCap },
    { label: "Ongoing Courses", value: "124", icon: BookOpen },
  ];

  return (
    <div className="mb-6 flex flex-col justify-between gap-6 px-6 md:flex-row md:items-end">
      <div>
        <h1 className="text-4xl font-normal text-gray-900 md:text-5xl">
          Welcome in, <span className="font-medium">LingoBee</span>
        </h1>
        
        {/* Small progress stats under title */}
        <div className="mt-6 flex gap-4 text-sm">
          <div className="w-24">
            <div className="mb-2 text-gray-600">New Enrollments</div>
            <div className="h-8 rounded-full bg-gray-900 px-3 py-1 flex items-center text-white">
              <span className="text-xs">15%</span>
            </div>
          </div>
          <div className="w-24">
            <div className="mb-2 text-gray-600">Completion</div>
            <div className="h-8 rounded-full bg-[#ffb800] px-3 py-1 flex items-center">
              <span className="text-xs font-medium">10%</span>
            </div>
          </div>
          <div className="w-48">
            <div className="mb-2 text-gray-600">Target</div>
            <div className="h-8 rounded-full border border-gray-200 bg-white/50 px-3 py-1 relative overflow-hidden">
               {/* Pattern overlay simulation */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-50"></div>
            </div>
          </div>
          <div className="w-24">
            <div className="mb-2 text-gray-600">Output</div>
            <div className="h-8 rounded-full border border-gray-300 bg-transparent px-3 py-1 flex items-center">
              <span className="text-xs">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-4xl font-light text-gray-900 md:text-5xl">{stat.value}</span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Check, Clock, UserPlus, BookOpen } from "lucide-react";

export function TaskWidget() {
  const tasks = [
    {
      title: "Teacher Interview",
      time: "Sep 13, 08:30",
      icon: UserPlus,
      completed: true,
    },
    {
      title: "Staff Sync",
      time: "Sep 13, 10:30",
      icon: Clock,
      completed: true,
    },
    {
      title: "Review New Materials",
      time: "Sep 13, 13:00",
      icon: BookOpen,
      completed: false,
    },
    {
      title: "Discuss Q3 Goals",
      time: "Sep 13, 14:45",
      icon: Clock,
      completed: false,
    },
    {
      title: "Policy Update",
      time: "Sep 13, 16:30",
      icon: BookOpen,
      completed: false,
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#0a1a1c] text-white shadow-sm border border-white/10">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-medium text-white/90">Pending Tasks</h3>
        <span className="text-3xl font-light text-white/80">2/8</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-4">
          {tasks.map((task, idx) => {
            const Icon = task.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <Icon className="h-4 w-4 text-white/60" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${task.completed ? "text-white/40 line-through" : "text-white/90"}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-white/40">{task.time}</p>
                  </div>
                </div>
                <div>
                  {task.completed ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffb800]">
                      <Check className="h-3 w-3 text-[#0a1a1c]" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-white/20 bg-transparent" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

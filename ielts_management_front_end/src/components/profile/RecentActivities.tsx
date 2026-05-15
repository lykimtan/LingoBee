/**
 * Recent Activities Component
 * Shows user's recent learning activities
 */

import Image from "next/image";
import Link from "next/link";

interface Activity {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_review" | "in_progress";
  type: "listening" | "writing" | "speaking" | "reading";
  score?: number;
  date: string;
  icon: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    title: "Listening Mock Test #14",
    description: "Completed 2 hours ago • Section 1-4",
    status: "completed",
    type: "listening",
    score: 8.0,
    date: "2 hours ago",
    icon: "/profile/headphones.gif",
  },
  {
    id: "2",
    title: "Writing Task 2 Practice",
    description: "Evaluation Pending • 'Climate Change' Essay",
    status: "in_review",
    type: "writing",
    date: "Today",
    icon: "/profile/writting.gif",
  },
  {
    id: "3",
    title: "Speaking Mock Interview",
    description: "Completed Yesterday • AI Tutor Feedback",
    status: "completed",
    type: "speaking",
    score: 7.0,
    date: "Yesterday",
    icon: "/profile/speaking.gif",
  },
];

const getStatusColor = (status: Activity["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 border-green-500/30 text-green-300";
    case "in_review":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-300";
    case "in_progress":
      return "bg-blue-500/10 border-blue-500/30 text-blue-300";
    default:
      return "bg-white/10 border-white/20 text-foreground";
  }
};

const getStatusLabel = (status: Activity["status"]) => {
  switch (status) {
    case "completed":
      return "✓ Completed";
    case "in_review":
      return "⏱️ In Review";
    case "in_progress":
      return "⟳ In Progress";
    default:
      return status;
  }
};

export const RecentActivities = ({
  activities = defaultActivities,
}: RecentActivitiesProps) => {
  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-lg font-semibold">Recent Activities</h3>
        <Link
          href="/profile/activities"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View History
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0">
                {activity.icon.startsWith("/") ? (
                  <div className="relative w-10 h-10">
                    <Image
                      src={activity.icon}
                      alt={activity.title}
                      width={40}
                      height={40}
                      unoptimized
                      sizes="40px"
                      className="object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="text-2xl">{activity.icon}</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                  {activity.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
              </div>
            </div>

            {/* Status and Score */}
            <div className="flex items-center gap-4 ml-4">
              {activity.score && (
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{activity.score}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              )}

              <div
                className={`px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}
              >
                {getStatusLabel(activity.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <button className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Load More Activities
      </button>
    </div>
  );
};
